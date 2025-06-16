import { Link } from 'react-router-dom';
import './about.css';
import { FacultyCards } from './Faculty/FacultyCards';
import { EventCalendar } from '../StudPage/eventcalendar';
import { Assistant } from '../Assistant/assistant';

export const About = () => {
  interface ContactInfo {
    description: string;
    numbers: string[];
  }

  interface PersonInfo {
    name: string;
    position: string;
    bio: string;
    img: string;
    link?: string;
  }

  const contacts: ContactInfo[] = [
    { description: 'Ректорат', numbers: ['+7 (4942) 63-49-00 (доб. 1010)'] },
    { description: 'Отдел кадров по работе с обучающимися', numbers: ['(доб. 643)'] },
    { description: 'Приемная комиссия', numbers: ['(доб. 644)'] },
    { description: 'Канцелярия', numbers: ['(доб. 1400)'] },
    { description: 'Бухгалтерия (по оплате за обучение)', numbers: ['(доб. 2112)', '(доб. 2113)'] },
    { description: 'Бухгалтерия (по заработной плате)', numbers: ['(доб. 2123)'] },
    { description: 'Отдел кадров', numbers: ['(доб. 1110)'] }
  ];

  const people: PersonInfo[] = [
    {
      name: 'Борисов Александр Сергеевич',
      position: 'Директор Института ВИТШ (с 14.03.2024)',
      bio: 'Экс-руководитель казанского IT-парка. Возглавил институт после масштабной реорганизации.',
      img: '/borisov_a_s.jpg',
      link: 'https://m.business-gazeta.ru/news/626388'
    },
    {
      name: 'Левин Михаил Григорьевич',
      position: 'Профессор, д.т.н. (1991-2010)',
      bio: 'Основоположник IT-направлений в КГТУ. Под его руководством открыты ключевые специальности.',
      img: '/levin_mg.jpg'
    },
    {
      name: 'Секованов Валерий Сергеевич',
      position: 'Зав. кафедрой (2002-2024)',
      bio: 'Д.п.н., профессор. Член Академии информатизации образования.',
      img: '/sekovanov_vs.jpg'
    },
    {
      name: 'Ивков Владимир Анатольевич',
      position: 'Зав. кафедрой прикладной математики (с 2024)',
      bio: 'К.э.н., доцент. Член-корреспондент Академии информатизации образования.',
      img: '/ivkov_va.jpg'
    }
  ];

  return (
    <div className="about-container">
      <header className="university-header">
        <h1>Институт Высшая ИТ-школа КГУ</h1>
        <div className="header-meta">
          <div className="meta-item">
            <span className="meta-label">Основан</span>
            <span className="meta-value">30 января 2024</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Расположение</span>
            <span className="meta-value">Корпус Б, ул. Ивановская, 24а</span>
          </div>
        </div>
      </header>

      <section className="contacts-section">
        <h2 className="section-title">Контакты</h2>
        <div className="contact-grid">
          {contacts.map((contact, index) => (
            <div key={index} className="contact-card">
              <h3>{contact.description}</h3>
              <div className="phone-numbers">
                {contact.numbers.map((num, i) => (
                  <a key={i} href={`tel:${num.replace(/[^0-9+]/g, '')}`} className="phone-link">
                    {num}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <main className="main-container">
        <section className="history-section">
          <h2 className="section-title">История создания</h2>
          <div className="timeline">
            <div className="timeline-event">
              <div className="event-date">30.01.2024</div>
              <div className="event-content">
                <h3>Решение ученого совета</h3>
                <p>Объединение всех IT-направлений КГУ в единый институт</p>
                <p>В состав вошли кафедры из ИФМЕН и ИАСТ:</p>
                <ul className="structure-list">
                  <li>Прикладной математики и информационных технологий</li>
                  <li>Защиты информации</li>
                  <li>Информационных систем и технологий</li>
                </ul>
              </div>
            </div>
            <div className="timeline-event">
              <div className="event-date">01.02.2024</div>
              <div className="event-content">
                <h3>Официальное утверждение</h3>
                <p>Приказ №37-ОД подписан ректором Чайковским Д.В.</p>
              </div>
            </div>
            <div className="timeline-event">
              <div className="event-date">14.03.2024</div>
              <div className="event-content">
                <h3>Назначение нового директора</h3>
                <p>Институт возглавил Александр Борисов, экс-руководитель казанского IT-парка</p>
              </div>
            </div>
          </div>

          <div className="institute-structure">
            <h3>Современная структура</h3>
            <div className="structure-grid">
              <div className="structure-card">
                <div className="structure-icon">🏛️</div>
                <div className="structure-content">
                  <h4>Дирекция института</h4>
                  <p>Административный и управленческий центр ВИТШ</p>
                </div>
              </div>

              <div className="structure-card">
                <div className="structure-icon">📐</div>
                <div className="structure-content">
                  <h4>Кафедра прикладной математики</h4>
                  <p>Направления: Прикладная математика, ИИ и машинное обучение</p>
                </div>
              </div>

              <div className="structure-card">
                <div className="structure-icon">🛡️</div>
                <div className="structure-content">
                  <h4>Кафедра защиты информации</h4>
                  <p>Кибербезопасность и криптография</p>
                </div>
              </div>

              <div className="structure-card">
                <div className="structure-icon">💻</div>
                <div className="structure-content">
                  <h4>Кафедра информационных систем</h4>
                  <p>Разработка ПО и системная архитектура</p>
                </div>
              </div>

              <div className="structure-card">
                <div className="structure-icon">🚀</div>
                <div className="structure-content">
                  <h4>Центр гибких технологий</h4>
                  <p>Инновационные проекты и стартапы</p>
                </div>
              </div>
            </div>
          </div>

          <FacultyCards />

          <div className="partners-block">
            <h3>Генеральный партнер</h3>
            <div className="partner-logo">
              <img src="/sovcombank.png" alt="Совкомбанк" />
            </div>
            <p className="partner-description">
              Совместные программы подготовки специалистов в области информационных технологий
            </p>
            <p className="partner-info">
              Реализация новой концепции подготовки IT-специалистов
              через частно-государственное партнерство.
            </p>
          </div>

          <div className="documents-button-container">
            <Link to="/documents" className="documents-button">
              Документы института
            </Link>
          </div>
        </section>

        <section className="personnel-section">
          <h2 className="section-title">Руководство и ключевые сотрудники</h2>
          <div className="personnel-grid">
            {people.map((person, index) => (
              <article key={index} className="person-card">
                <img src={person.img} alt={person.name} className="person-photo" />
                <div className="person-info">
                  <h3>{person.name}</h3>
                  <p className="position">{person.position}</p>
                  <p className="bio">{person.bio}</p>
                  {person.link && (
                    <a href={person.link} target="_blank" rel="noopener noreferrer" className="person-link">
                      Подробнее →
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

        </section>

        <section className="it-history-section">
          <h2 className="section-title">История IT-направлений</h2>
          <div className="history-accordion">
            <details className="accordion-item">
              <summary className="accordion-header">КГТУ (1971-2016)</summary>
              <div className="accordion-content">
                <ul className="history-timeline">
                  <li><strong>1971</strong> - Основание механико-технологического факультета</li>
                  <li><strong>1989</strong> - Создание кафедры Вычислительной техники</li>
                  <li><strong>1991</strong> - М.Г. Левин возглавил кафедру, начало развития IT-направлений</li>
                  <li><strong>1994</strong> - Открытие специальности «Системы автоматизированного проектирования»</li>
                  <li><strong>1997</strong> - Преобразование в ФАСТ</li>
                  <li><strong>1998</strong> - Запуск специальности «Информационные системы и технологии»</li>
                  <li><strong>2008</strong> - Открытие специальности «Информационные технологии в дизайне»</li>
                  <li><strong>2010</strong> - Запуск направлений «Информационная безопасность» и «Информатика и вычислительная техника»</li>
                  <li><strong>2013</strong> - Разделение кафедры на «Информационных систем» и «Защиты информации»</li>
                </ul>
              </div>
            </details>

            <details className="accordion-item">
              <summary className="accordion-header">КГУ им. Некрасова</summary>
              <div className="accordion-content">
                <ul className="history-timeline">
                  <li><strong>1988</strong> - Создание кафедры информатики и вычислительной математики</li>
                  <li><strong>1997</strong> - Открытие специальности «Информатика с дополнительной специальностью математика»</li>
                  <li><strong>2002</strong> - Запуск программы «Прикладная математика и информатика»</li>
                  <li><strong>2007</strong> - Активное сотрудничество с Академией информатизации образования</li>
                  <li><strong>2024</strong> - Кафедру возглавил к.э.н., доцент Ивков В.А.</li>
                </ul>
              </div>
            </details>
          </div>
        </section>
      </main>
      <EventCalendar />
      <Assistant />
    </div>
  );
};