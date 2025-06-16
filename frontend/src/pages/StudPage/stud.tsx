import { useState, useEffect } from 'react';
import { EventCalendar } from './eventcalendar';
import './stud.css';
import axios from 'axios';
import { Assistant } from '../Assistant/assistant';

interface ApiEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  group_name: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_end: string | null;
  creator_name: string;
  participants: any[];
  created_at: string;
}

interface EventsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiEvent[];
}

interface EditEventForm {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  group_id: number | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  recurrence_end: string | null;
}

interface UserData {
  id: number;
  role: string;
  username: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  avatar: string | null;
}

const EVENT_TYPES: Record<string, string> = {
  personal: 'Личное',
  group: 'Групповое',
  global: 'Общее',
  deadline: 'Дедлайн'
};

const EVENT_COLORS: Record<string, string> = {
  personal: '#3b82f6', // blue-500
  group: '#10b981', // emerald-500
  global: '#f59e0b', // amber-500
  deadline: '#ef4444' // red-500
};

export const Stud = () => {
  const [eventsData, setEventsData] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<ApiEvent | null>(null);
  const [editForm, setEditForm] = useState<EditEventForm>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    event_type: 'personal',
    group_id: null,
    is_recurring: false,
    recurrence_rule: null,
    recurrence_end: null
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const isAuth = !!cookies['access_token'];
      setIsAuthenticated(isAuth);

      if (isAuth) {
        try {
          const accessToken = cookies['access_token'];
          const response = await axios.get<UserData>(
            'https://vits44.ru/api/users/me/',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Ошибка при загрузке данных пользователя:', err);
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (isAuthenticated) {
          const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

          const accessToken = cookies['access_token'];
          const response = await axios.get<EventsResponse>(
            'https://vits44.ru/api/events/',
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setEventsData(response.data);
        } else {
          const response = await axios.get<EventsResponse>(
            'https://vits44.ru/api/events/',
            {
              params: {
                event_type: 'global'
              }
            }
          );
          setEventsData(response.data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке событий:', err);
        setError('Не удалось загрузить события');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);

  const isEventCreator = (event: ApiEvent) => {
    if (!currentUser || !isAuthenticated) return false;
    return event.creator_name.includes(currentUser.first_name) && 
           event.creator_name.includes(currentUser.last_name);
  };

  const handleEditClick = (event: ApiEvent) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      event_type: event.event_type,
      group_id: event.group_name ? parseInt(event.group_name) : null,
      is_recurring: event.is_recurring,
      recurrence_rule: event.recurrence_rule,
      recurrence_end: event.recurrence_end
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const accessToken = cookies['access_token'];

      const response = await axios.put(
        `https://vits44.ru/api/events/${editingEvent.id}/`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (eventsData) {
        const updatedEvents = eventsData.results.map(event => 
          event.id === editingEvent.id ? response.data : event
        );
        setEventsData({
          ...eventsData,
          results: updatedEvents
        });
      }

      setEditingEvent(null);
    } catch (err) {
      console.error('Ошибка при обновлении события:', err);
      setError('Не удалось обновить событие');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const timeString = date.toLocaleTimeString('ru-RU', timeOptions);

    if (date.toDateString() === today.toDateString()) {
      return `${timeString}, сегодня`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `${timeString}, завтра`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
      return `${timeString}, ${date.toLocaleDateString('ru-RU', dateOptions)}`;
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startTime = startDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const endTime = endDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${startTime} – ${endTime}`;
  };

  if (isLoading) {
    return <div className="stud-container">Загрузка событий...</div>;
  }

  return (
    <div className="stud-container">
      <h2 className="stud-title">
        {isAuthenticated ? 'Ваши ближайшие события' : 'Общие мероприятия'}
      </h2>

      <div className="stud-content">
        <div className="stud-calendar">
          <EventCalendar />
          <Assistant />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="stud-events-section">
          {eventsData?.results && eventsData.results.length > 0 ? (
            <div className="stud-card-grid">
              {eventsData.results.map((event) => (
                <div
                  className={`stud-card stud-card-${event.event_type}`}
                  key={event.id}
                  style={{ borderLeft: `4px solid ${EVENT_COLORS[event.event_type] || '#3b82f6'}` }}
                >
                  <div className="stud-card-header">
                    <h3 className="stud-card-title">{event.title}</h3>
                    <span className={`stud-card-type stud-card-type-${event.event_type}`}>
                      {EVENT_TYPES[event.event_type] || event.event_type}
                    </span>
                  </div>
                  <div className="stud-card-body">
                    <p className="stud-card-text">
                      <span className="stud-card-label">Время:</span>
                      {formatTimeRange(event.start_time, event.end_time)}, {formatDate(event.start_time)}
                    </p>
                    <p className="stud-card-text">
                      <span className="stud-card-label">Описание:</span>
                      {event.description}
                    </p>
                    <p className="stud-card-text">
                      <span className="stud-card-label">Организатор:</span>
                      {event.creator_name}
                    </p>
                  </div>
                  
                  {isAuthenticated && isEventCreator(event) && (
                    <div className="stud-card-footer">
                      <button 
                        className="stud-edit-button"
                        onClick={() => handleEditClick(event)}
                      >
                        Редактировать
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events-message">
              Событий пока что нет
            </div>
          )}
        </div>
      </div>

      {editingEvent && (
        <div className="stud-edit-modal">
          <div className="stud-edit-modal-content">
            <h3>Редактирование события</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="stud-form-group">
                <label>Название:</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="stud-form-group">
                <label>Описание:</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>
              <div className="stud-form-group">
                <label>Начало:</label>
                <input
                  type="datetime-local"
                  value={editForm.start_time.slice(0, 16)}
                  onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="stud-form-group">
                <label>Окончание:</label>
                <input
                  type="datetime-local"
                  value={editForm.end_time.slice(0, 16)}
                  onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                  required
                />
              </div>
              <div className="stud-form-group">
                <label>Тип события:</label>
                <select
                  value={editForm.event_type}
                  onChange={(e) => setEditForm({...editForm, event_type: e.target.value})}
                >
                  {Object.entries(EVENT_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="stud-form-actions">
                <button type="button" onClick={() => setEditingEvent(null)}>
                  Отмена
                </button>
                <button type="submit">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};