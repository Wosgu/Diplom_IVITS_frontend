import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { FiCalendar, FiX } from 'react-icons/fi';

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
    recurrenceRule?: string;
    eventType: string;
    groupId: number;
  };
}

interface ApiEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurrence_rule?: string;
  event_type: string;
  group_id: number;
}

export const EventCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [range, setRange] = useState<{ start: Date; end: Date }>({
    start: moment().startOf('month').toDate(),
    end: moment().endOf('month').toDate()
  });

  const getAccessToken = () => localStorage.getItem('accessToken');

  const fetchEvents = async (start: Date, end: Date, signal?: AbortSignal) => {
    const token = getAccessToken();
    if (!token) {
      setError('Требуется авторизация');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<ApiEvent[]>('https://tamik327.pythonanywhere.com/api/events/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          start_time__gte: moment(start).utc().format(),
          end_time__lte: moment(end).utc().format()
        },
        signal
      });

      const formattedEvents = response.data.map(event => ({
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
          groupId: event.group_id
        }
      }));

      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      if (!axios.isCancel(err)) {
        handleError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      error.response?.status === 401
        ? setError('Сессия истекла. Войдите снова')
        : setError(`Ошибка ${error.response?.status || 'соединения'}`);
    } else {
      setError('Неизвестная ошибка');
    }
  };

  const handleRangeChange = (newRange: Date[] | { start: Date; end: Date }) => {
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
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const loadData = async () => {
      await fetchEvents(range.start, range.end, controller.signal);
    };

    loadData();

    return () => controller.abort();
  }, [range]);

  const eventStyleGetter = (event: Event) => {
    const isPast = moment(event.end).isBefore(new Date());
    return {
      style: {
        backgroundColor: isPast ? '#6c757d' : event.resource.isRecurring ? '#5cb85c' : '#3174ad',
        borderRadius: '4px',
        color: 'white',
        border: 'none',
      }
    };
  };

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
                }}
                className="close-button"
                aria-label="Закрыть календарь"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="modal-content">
              {selectedEvent ? (
                <div className="event-details">
                  <h3>{selectedEvent.title}</h3>
                  <p>{selectedEvent.resource.description}</p>
                  <div className="event-time">
                    <span>Начало: {moment(selectedEvent.start).format('DD.MM.YYYY HH:mm')}</span>
                    <span>Конец: {moment(selectedEvent.end).format('DD.MM.YYYY HH:mm')}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="back-button"
                  >
                    Назад к календарю
                  </button>
                </div>
              ) : (
                <div className="calendar-wrapper">
                  {loading ? (
                    <div className="loader-container">
                      <div className="spinner" aria-label="Загрузка..." />
                    </div>
                  ) : error ? (
                    <div className="error-container">
                      <p>{error}</p>
                      <button onClick={() => window.location.reload()}>Обновить</button>
                    </div>
                  ) : (
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
                      eventPropGetter={eventStyleGetter}
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
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};