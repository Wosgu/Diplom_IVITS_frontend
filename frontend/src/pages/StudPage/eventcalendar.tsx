import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { FiCalendar, FiX, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { ApiEndpointHelper, useAuth } from '../../Context/AuthContext';
import './eventcalendar.css';
import Cookies from 'js-cookie';

moment.locale('ru');
const localizer = momentLocalizer(moment);

interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: {
    description: string;
    isRecurring: boolean;
    recurrenceRule?: any;
    eventType: string;
    groupId: number | null;
    groupName?: string | null;
  };
}

interface ApiEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: any;
  event_type: string;
  group_id: number | null;
}

interface ApiResponse {
  results?: ApiEvent[];
  events?: ApiEvent[];
  data?: ApiEvent[];
  [key: string]: any;
}

interface Group {
  id: number;
  name: string;
  students: number[];
}

interface GroupsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Group[];
}

const RECURRENCE_TYPES = {
  DAILY: 'Ежедневно',
  WEEKLY: 'Еженедельно',
  MONTHLY: 'Ежемесячно',
  YEARLY: 'Ежегодно'
};

const EVENT_TYPES = {
  personal: 'Личное',
  group: 'Групповое',
  global: 'Общее',
  deadline: 'Дедлайн'
};

export const EventCalendar = () => {
  const { isAuthenticated, userData } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [range, setRange] = useState<{ start: Date; end: Date }>({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  });
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start_time: moment().format('YYYY-MM-DDTHH:mm'),
    end_time: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    is_recurring: false,
    recurrence_rule: { freq: '', interval: 1 },
    event_type: 'personal',
    group_id: null as number | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const token = Cookies.get('access_token');
      const response = await axios.get<GroupsResponse>(
        'https://vits44.ru/api/groups/',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setGroups(response.data.results);
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const canCreateEvent = useCallback((eventType: string) => {
    if (!userData) return false;
    
    if (eventType === 'personal') {
      return ['guest', 'student', 'teacher', 'admin'].includes(userData.role);
    }
    
    if (eventType === 'group' || eventType === 'deadline') {
      return ['teacher', 'admin'].includes(userData.role);
    }
    
    if (eventType === 'global') {
      return userData.role === 'admin';
    }
    
    return false;
  }, [userData]);

  const canCreateAnyEvent = useCallback(() => {
    if (!userData) return false;
    return ['guest', 'student', 'teacher', 'admin'].includes(userData.role);
  }, [userData]);

  const fetchEvents = useCallback(async (start: Date, end: Date) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get('access_token');
      const response = await axios.get<ApiResponse>(
        ApiEndpointHelper.events(),
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            start_time__gte: moment(start).utc().format(),
            end_time__lte: moment(end).utc().format()
          }
        }
      );

      let eventsData: ApiEvent[] = [];
      
      if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data.results) {
        eventsData = response.data.results;
      } else if (response.data.events) {
        eventsData = response.data.events;
      } else if (response.data.data) {
        eventsData = response.data.data;
      }

      // Форматируем события сразу, без ожидания загрузки групп
      const formattedEvents = eventsData.map((event) => {
        const group = groups.find(g => g.id === event.group_id);
        return {
          id: event.id,
          title: event.title,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          allDay: false,
          resource: {
            description: event.description,
            isRecurring: event.is_recurring,
            recurrenceRule: event.recurrence_rule,
            eventType: event.event_type,
            groupId: event.group_id,
            groupName: group ? group.name : null
          }
        };
      });

      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Ошибка загрузки событий:', err);
        setError('Не удалось загрузить события. Попробуйте обновить страницу.');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, groups]);

  const handleRangeChange = useCallback((newRange: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(newRange)) {
      setRange({
        start: moment(newRange[0]).startOf('day').toDate(),
        end: moment(newRange[newRange.length - 1]).endOf('day').toDate()
      });
    } else {
      setRange({
        start: moment(newRange.start).startOf('day').toDate(),
        end: moment(newRange.end).endOf('day').toDate()
      });
    }
  }, []);

  // Загружаем группы при монтировании компонента
  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups();
    }
  }, [isAuthenticated, fetchGroups]);

  // Загружаем события при изменении диапазона
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const loadData = async () => {
      await fetchEvents(range.start, range.end);
    };

    loadData();

    return () => controller.abort();
  }, [range, fetchEvents]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreateEvent(newEvent.event_type)) {
      setError('У вас нет прав на создание событий этого типа');
      return;
    }

    const errors: Record<string, string> = {};
    if (!newEvent.title.trim()) errors.title = 'Название обязательно';
    if (!newEvent.start_time) errors.start_time = 'Укажите время начала';
    if (!newEvent.end_time) errors.end_time = 'Укажите время окончания';
    if (moment(newEvent.end_time).isBefore(moment(newEvent.start_time))) {
      errors.end_time = 'Время окончания должно быть после времени начала';
    }
    if (newEvent.is_recurring && !newEvent.recurrence_rule.freq) {
      errors.recurrence_rule = 'Выберите частоту повторения';
    }
    if (['group', 'deadline'].includes(newEvent.event_type) && !newEvent.group_id) {
      errors.group_id = 'Для групповых событий и дедлайнов требуется указать группу';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      const token = Cookies.get('access_token');
      const eventData = {
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        start_time: moment(newEvent.start_time).utc().format(),
        end_time: moment(newEvent.end_time).utc().format(),
        event_type: newEvent.event_type,
        is_recurring: newEvent.is_recurring,
        recurrence_rule: newEvent.is_recurring ? newEvent.recurrence_rule : null,
        recurrence_end: newEvent.is_recurring ? 
          moment(newEvent.end_time).add(1, 'year').utc().format() : null,
        group_id: ['group', 'deadline'].includes(newEvent.event_type) ? newEvent.group_id : null
      };

      const response = await axios.post<ApiEvent>(
        ApiEndpointHelper.events(),
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const group = groups.find(g => g.id === newEvent.group_id);
      const createdEvent = {
        id: response.data.id,
        title: response.data.title,
        start: new Date(response.data.start_time),
        end: new Date(response.data.end_time),
        allDay: false,
        resource: {
          description: response.data.description,
          isRecurring: response.data.is_recurring,
          recurrenceRule: response.data.recurrence_rule,
          eventType: response.data.event_type,
          groupId: response.data.group_id,
          groupName: group ? group.name : null
        }
      };

      setEvents(prev => [...prev, createdEvent]);
      setNewEvent({
        title: '',
        description: '',
        start_time: moment().format('YYYY-MM-DDTHH:mm'),
        end_time: moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
        is_recurring: false,
        recurrence_rule: { freq: '', interval: 1 },
        event_type: 'personal',
        group_id: null
      });
      setShowAddEvent(false);
      setFormErrors({});
      setError(null);
    } catch (err) {
      console.error('Ошибка создания события:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          const serverErrors = err.response.data;
          if (typeof serverErrors === 'object') {
            const validationErrors: Record<string, string> = {};
            Object.entries(serverErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                validationErrors[field] = messages.join(', ');
              } else {
                validationErrors[field] = String(messages);
              }
            });
            setFormErrors(validationErrors);
            setError('Пожалуйста, исправьте ошибки в форме');
          } else {
            setError('Некорректные данные для создания события');
          }
        } else if (err.response?.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите снова');
        } else if (err.response?.status === 403) {
          setError('У вас нет прав на создание этого типа событий');
        } else {
          setError('Не удалось создать событие. Попробуйте позже');
        }
      } else {
        setError('Произошла непредвиденная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewEvent(prev => ({
      ...prev,
      recurrence_rule: {
        ...prev.recurrence_rule,
        freq: e.target.value,
        interval: 1
      }
    }));

    if (formErrors.recurrence_rule) {
      setFormErrors(prev => ({
        ...prev,
        recurrence_rule: ''
      }));
    }
  };

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value;
    const finalEventType = canCreateEvent(eventType) ? eventType : 'personal';
    
    setNewEvent(prev => ({
      ...prev,
      event_type: finalEventType,
      group_id: ['group', 'deadline'].includes(finalEventType) ? prev.group_id || 0 : null
    }));

    if (formErrors.event_type || formErrors.group_id) {
      setFormErrors(prev => ({
        ...prev,
        event_type: '',
        group_id: ''
      }));
    }
  };

  const renderCalendarView = useMemo(() => () => (
    <div className="calendar-wrapper">
      {loading && (
        <div className="loader-container">
          <div className="spinner" aria-label="Загрузка..." />
        </div>
      )}
      
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => window.location.reload()} className="refresh-button">
            Обновить
          </button>
        </div>
      )}
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={currentView}
        view={currentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onRangeChange={handleRangeChange}
        onView={setCurrentView}
        onSelectEvent={setSelectedEvent}
        selectable
        popup
        eventPropGetter={(event) => {
          const isPast = moment(event.end).isBefore(new Date());
          let backgroundColor;
          
          if (isPast) {
            backgroundColor = '#6c757d';
          } else {
            switch (event.resource.eventType) {
              case 'personal':
                backgroundColor = '#3174ad';
                break;
              case 'group':
                backgroundColor = '#5cb85c';
                break;
              case 'global':
                backgroundColor = '#f0ad4e';
                break;
              case 'deadline':
                backgroundColor = '#d9534f';
                break;
              default:
                backgroundColor = '#5bc0de';
            }
          }

          return {
            style: {
              backgroundColor,
              borderRadius: '4px',
              color: 'white',
              border: 'none',
              opacity: isPast ? 0.7 : 1,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }
          };
        }}
        messages={{
          today: 'Сегодня',
          previous: 'Назад',
          next: 'Вперёд',
          month: 'Месяц',
          week: 'Неделя',
          day: 'День',
          agenda: 'Список',
          date: 'Дата',
          time: 'Время',
          event: 'Событие',
          noEventsInRange: 'Нет событий в выбранном диапазоне.',
        }}
      />
      
      {userData && canCreateAnyEvent() && (
        <button 
          onClick={() => setShowAddEvent(true)}
          className="add-event-button"
          aria-label="Добавить событие"
          disabled={loading}
        >
          <FiPlus size={20} />
          <span>Добавить событие</span>
        </button>
      )}
    </div>
  ), [loading, error, events, currentView, currentDate, handleRangeChange, userData, canCreateAnyEvent]);

  const renderAddEventForm = useMemo(() => () => {
    const availableEventTypes = Object.entries(EVENT_TYPES).filter(([key]) => 
      canCreateEvent(key)
    );

    return (
      <div className="add-event-form">
        <button 
          onClick={() => {
            setShowAddEvent(false);
            setFormErrors({});
            setError(null);
          }}
          className="back-button"
          disabled={loading}
        >
          <FiArrowLeft size={20} />
          <span>Назад к календарю</span>
        </button>

        <h3>Добавить новое событие</h3>
        
        {error && !Object.keys(formErrors).length && (
          <div className="form-error-banner">{error}</div>
        )}
        
        <form onSubmit={handleAddEvent}>
          <div className="form-group">
            <label htmlFor="title">Название события*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              className={formErrors.title ? 'error' : ''}
              disabled={loading}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              rows={3}
              disabled={loading}
              className={formErrors.description ? 'error' : ''}
            />
            {formErrors.description && <span className="error-message">{formErrors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Начало*</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={newEvent.start_time}
                onChange={handleInputChange}
                className={formErrors.start_time ? 'error' : ''}
                disabled={loading}
              />
              {formErrors.start_time && <span className="error-message">{formErrors.start_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_time">Окончание*</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={newEvent.end_time}
                onChange={handleInputChange}
                className={formErrors.end_time ? 'error' : ''}
                disabled={loading}
              />
              {formErrors.end_time && <span className="error-message">{formErrors.end_time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="event_type">Тип события*</label>
            <select
              id="event_type"
              name="event_type"
              value={newEvent.event_type}
              onChange={handleEventTypeChange}
              disabled={loading}
              className={formErrors.event_type ? 'error' : ''}
            >
              {availableEventTypes.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {formErrors.event_type && <span className="error-message">{formErrors.event_type}</span>}
          </div>

          {(newEvent.event_type === 'group' || newEvent.event_type === 'deadline') && (
            <div className="form-group">
              <label htmlFor="group_id">Группа*</label>
              <select
                id="group_id"
                name="group_id"
                value={newEvent.group_id || ''}
                onChange={handleInputChange}
                disabled={loading || groupsLoading}
                className={formErrors.group_id ? 'error' : ''}
              >
                <option value="">Выберите группу</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {formErrors.group_id && <span className="error-message">{formErrors.group_id}</span>}
            </div>
          )}

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="is_recurring"
              name="is_recurring"
              checked={newEvent.is_recurring}
              onChange={handleInputChange}
              disabled={loading}
              className={formErrors.is_recurring ? 'error' : ''}
            />
            <label htmlFor="is_recurring">Повторяющееся событие</label>
            {formErrors.is_recurring && <span className="error-message">{formErrors.is_recurring}</span>}
          </div>

          {newEvent.is_recurring && (
            <>
              <div className="form-group">
                <label htmlFor="recurrence_freq">Частота повторения*</label>
                <select
                  id="recurrence_freq"
                  name="recurrence_freq"
                  value={newEvent.recurrence_rule.freq}
                  onChange={handleRecurrenceChange}
                  disabled={loading}
                  className={formErrors.recurrence_rule ? 'error' : ''}
                >
                  <option value="">Выберите частоту</option>
                  {Object.entries(RECURRENCE_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {formErrors.recurrence_rule && <span className="error-message">{formErrors.recurrence_rule}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="recurrence_interval">Интервал повторения</label>
                <input
                  type="number"
                  id="recurrence_interval"
                  name="recurrence_interval"
                  min="1"
                  value={newEvent.recurrence_rule.interval}
                  onChange={(e) => setNewEvent(prev => ({
                    ...prev,
                    recurrence_rule: {
                      ...prev.recurrence_rule,
                      interval: parseInt(e.target.value) || 1
                    }
                  }))}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="submit-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small" aria-hidden="true" />
                <span>Сохранение...</span>
              </>
            ) : (
              'Создать событие'
            )}
          </button>
        </form>
      </div>
    );
  }, [loading, error, formErrors, newEvent, groups, groupsLoading, handleAddEvent, handleInputChange, handleRecurrenceChange, handleEventTypeChange, canCreateEvent]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="floating-calendar-button"
        aria-label="Открыть календарь"
      >
        <FiCalendar size={24} />
      </button>

      {isOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <div className="modal-header">
              <h2>Календарь событий</h2>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setSelectedEvent(null);
                  setShowAddEvent(false);
                  setError(null);
                  setFormErrors({});
                }}
                className="close-button"
                aria-label="Закрыть календарь"
                disabled={loading}
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-content-t">
              {selectedEvent ? (
                <div className="event-details">
                  <h3>{selectedEvent.title}</h3>
                  <p>{selectedEvent.resource.description || 'Нет описания'}</p>
                  <div className="event-meta">
                    <div className="event-time">
                      <span>Начало: {moment(selectedEvent.start).format('DD.MM.YYYY HH:mm')}</span>
                      <span>Конец: {moment(selectedEvent.end).format('DD.MM.YYYY HH:mm')}</span>
                    </div>
                    <div className="event-type">
                      <span className={`event-type-badge ${selectedEvent.resource.eventType}`}>
                        {EVENT_TYPES[selectedEvent.resource.eventType as keyof typeof EVENT_TYPES]}
                      </span>
                      {selectedEvent.resource.isRecurring && selectedEvent.resource.recurrenceRule && (
                        <span className="recurring-badge">
                          {RECURRENCE_TYPES[selectedEvent.resource.recurrenceRule.freq as keyof typeof RECURRENCE_TYPES] || 'Повторяющееся'}
                        </span>
                      )}
                    </div>
                    {selectedEvent.resource.groupId && (
                      <div className="event-group">
                        <span>Группа: {selectedEvent.resource.groupName || `ID: ${selectedEvent.resource.groupId}`}</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="back-button"
                    disabled={loading}
                  >
                    Назад к календарю
                  </button>
                </div>
              ) : showAddEvent ? (
                renderAddEventForm()
              ) : (
                renderCalendarView()
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};