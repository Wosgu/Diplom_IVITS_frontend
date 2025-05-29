import { useState } from 'react';
import './stud.css';

type Application = {
  id: number;
  type: string;
  status: string;
  date: string;
  description?: string;
};

type Document = {
  id: number;
  name: string;
  requested: boolean;
  ready: boolean;
};

type Notification = {
  id: number;
  text: string;
  date: string;
  read: boolean;
};

type NewApplication = {
  type: string;
  description: string;
};

export const Stud = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [applications, setApplications] = useState<Application[]>([
    { id: 1, type: 'Академический отпуск', status: 'В обработке', date: '2023-05-15' },
    { id: 2, type: 'Перевод на другой факультет', status: 'Одобрено', date: '2023-04-10' },
    { id: 3, type: 'Справка об обучении', status: 'Отклонено', date: '2023-03-22' }
  ]);
  
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: 'Справка об обучении', requested: true, ready: false },
    { id: 2, name: 'Академическая выписка', requested: false, ready: false },
    { id: 3, name: 'Копия приказа о зачислении', requested: true, ready: true }
  ]);
  
  const [newApplication, setNewApplication] = useState<NewApplication>({
    type: '',
    description: ''
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, text: 'Ваша заявка на академический отпуск была принята в обработку', date: '2023-05-15', read: false },
    { id: 2, text: 'Завтра в 10:00 собрание студсовета', date: '2023-05-14', read: true },
    { id: 3, text: 'Доступны новые учебные материалы по дисциплине "Математика"', date: '2023-05-10', read: true }
  ]);
  
  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: Application = {
      id: applications.length + 1,
      type: newApplication.type,
      status: 'В обработке',
      date: new Date().toISOString().split('T')[0],
      description: newApplication.description
    };
    setApplications([...applications, newApp]);
    setNewApplication({ type: '', description: '' });
    
    // Добавляем уведомление
    const newNotification: Notification = {
      id: notifications.length + 1,
      text: `Ваша заявка на ${newApp.type} была создана`,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    setNotifications([newNotification, ...notifications]);
  };
  
  const requestDocument = (docId: number) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, requested: true } : doc
    ));
    
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      const newNotification: Notification = {
        id: notifications.length + 1,
        text: `Вы запросили документ: ${doc.name}`,
        date: new Date().toISOString().split('T')[0],
        read: false
      };
      setNotifications([newNotification, ...notifications]);
    }
  };
  
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const renderRecentActivityItem = (item: Application | Document) => {
    if ('type' in item) {
      return <span>Заявка: {item.type} - {item.status}</span>;
    } else {
      return <span>Документ: {item.name} - {item.ready ? 'Готов' : 'В обработке'}</span>;
    }
  };

  const sortRecentActivity = (a: Application | Document, b: Application | Document) => {
    const dateA = 'date' in a ? new Date(a.date) : new Date();
    const dateB = 'date' in b ? new Date(b.date) : new Date();
    return dateB.getTime() - dateA.getTime();
  };
  
  return (
    <div className="student-portal">
      <div className="portal-container">
        <nav className="sidebar">
          <ul>
            <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <i className="icon-dashboard"></i> Главная
            </li>
            <li className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>
              <i className="icon-applications"></i> Мои заявки
            </li>
            <li className={activeTab === 'documents' ? 'active' : ''} onClick={() => setActiveTab('documents')}>
              <i className="icon-documents"></i> Документы
            </li>
            <li className={activeTab === 'schedule' ? 'active' : ''} onClick={() => setActiveTab('schedule')}>
              <i className="icon-schedule"></i> Расписание
            </li>
            <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
              <i className="icon-notifications"></i> Уведомления
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
              )}
            </li>
          </ul>
        </nav>
        
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Активные заявки</h3>
                  <p>{applications.filter(a => a.status === 'В обработке').length}</p>
                </div>
                <div className="stat-card">
                  <h3>Запрошенные документы</h3>
                  <p>{documents.filter(d => d.requested && !d.ready).length}</p>
                </div>
                <div className="stat-card">
                  <h3>Новые уведомления</h3>
                  <p>{notifications.filter(n => !n.read).length}</p>
                </div>
              </div>
              
              <div className="quick-actions">
                <h2>Быстрые действия</h2>
                <div className="action-buttons">
                  <button onClick={() => setActiveTab('applications')} className="action-btn">
                    <i className="icon-add-app"></i> Подать заявку
                  </button>
                  <button onClick={() => setActiveTab('documents')} className="action-btn">
                    <i className="icon-request-doc"></i> Запросить документ
                  </button>
                </div>
              </div>
              
              <div className="recent-activity">
                <h2>Последние действия</h2>
                <ul>
                  {[...applications, ...documents.filter(d => d.requested)]
                    .sort(sortRecentActivity)
                    .slice(0, 3)
                    .map(item => (
                      <li key={item.id}>
                        {renderRecentActivityItem(item)}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div className="applications-section">
              <h2>Мои заявки</h2>
              
              <div className="application-list">
                {applications.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Тип заявки</th>
                        <th>Статус</th>
                        <th>Дата подачи</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id}>
                          <td>{app.type}</td>
                          <td>
                            <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>{app.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>У вас нет активных заявок</p>
                )}
              </div>
              
              <div className="new-application">
                <h3>Подать новую заявку</h3>
                <form onSubmit={handleApplicationSubmit}>
                  <div className="form-group">
                    <label>Тип заявки</label>
                    <select 
                      value={newApplication.type}
                      onChange={(e) => setNewApplication({...newApplication, type: e.target.value})}
                      required
                    >
                      <option value="">Выберите тип заявки</option>
                      <option value="Академический отпуск">Академический отпуск</option>
                      <option value="Перевод на другой факультет">Перевод на другой факультет</option>
                      <option value="Справка об обучении">Справка об обучении</option>
                      <option value="Пересдача экзамена">Пересдача экзамена</option>
                      <option value="Другое">Другое</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Описание</label>
                    <textarea 
                      value={newApplication.description}
                      onChange={(e) => setNewApplication({...newApplication, description: e.target.value})}
                      placeholder="Опишите вашу заявку подробнее..."
                    />
                  </div>
                  
                  <button type="submit" className="submit-btn">Отправить заявку</button>
                </form>
              </div>
            </div>
          )}
          
          {activeTab === 'documents' && (
            <div className="documents-section">
              <h2>Документы</h2>
              
              <div className="document-list">
                {documents.map(doc => (
                  <div key={doc.id} className="document-card">
                    <div className="doc-info">
                      <h3>{doc.name}</h3>
                      <p>
                        Статус: {doc.requested 
                          ? (doc.ready ? 'Готов к выдаче' : 'В обработке') 
                          : 'Не запрошен'}
                      </p>
                    </div>
                    <div className="doc-actions">
                      {!doc.requested ? (
                        <button 
                          onClick={() => requestDocument(doc.id)} 
                          className="request-btn"
                        >
                          Запросить
                        </button>
                      ) : doc.ready ? (
                        <button className="download-btn">Скачать</button>
                      ) : (
                        <button disabled className="processing-btn">В обработке</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <h2>Уведомления</h2>
              
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="notification-content">
                        <p>{notif.text}</p>
                        <span className="notification-date">{notif.date}</span>
                      </div>
                      {!notif.read && <div className="unread-dot"></div>}
                    </div>
                  ))
                ) : (
                  <p>У вас нет уведомлений</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'schedule' && (
            <div className="schedule-section">
              <h2>Расписание</h2>
              <div className="schedule-placeholder">
                <p>Здесь будет отображаться ваше расписание занятий</p>
                {/* Здесь можно интегрировать компонент EventCalendar */}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};