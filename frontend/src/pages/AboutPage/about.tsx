import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import './about.css';

export const About = () => {
  const navigate = useNavigate();

  // Интерфейс для описания структуры контакта
interface ContactInfo {
  description: string;
  numbers: string[];
}
const contacts: ContactInfo[] = [
  {
    description: 'ректорат',
    numbers: ['+7 (4942) 63-49-00 (доб. 1010)']
  },
  {
    description: 'отдел кадров по работе с обучающимися', 
    numbers: ['(доб. 643)']
  },
  {
    description: 'приемная комиссия',
    numbers: ['(доб. 644)']
  },
  {
    description: 'канцелярия',
    numbers: ['(доб. 1400)']
  },
  {
    description: 'бухгалтерия (по оплате за обучение)',
    numbers: ['(доб. 2112)', '(доб. 2113)']
  },
  {
    description: 'бухгалтерия (по заработной плате)',
    numbers: ['(доб. 2123)']
  },
  {
    description: 'отдел кадров',
    numbers: ['(доб. 1110)']
  }
];

  return (
    <>
      <header className="header">
        <div className="logo">
            <Link to="/" style={{ textDecoration: 'none' }}>
                <h1>Высшая ИТ-Школа</h1>
            </Link>
        </div>
        <nav className="nav">
          <ul>
            <li><Link to="/about">Сведения об организации</Link></li>
            <li><Link to="/abitur">Абитуриенту</Link></li>
            <li><Link to="/stud">Студенту</Link></li>
            <li><Link to="/lifeinst">Жизнь института</Link></li>
            <li><Link to="/museum">Музей</Link></li>
          </ul>
        </nav>
        <button className="login-btn" onClick={() => navigate('/login')}>Войти</button>
      </header>

      <div className="about-content">
        <h1>Контактная информация</h1>
        <p>
          Полное наименование образовательной организации
        </p>
        <p>
        Федеральное государственное бюджетное образовательное учреждение высшего образования Костромской государственный университет (КГУ)
        </p>
        <p>Сокращенное (при наличии) наименование образовательной организации</p>
        <p>ФГБОУ ВО Костромской государственный университет (КГУ)</p>
        <p>Дата создания образовательной организации: 26.07.1932</p>
        <p>Адрес: 156005, Костромская область, городской округ город Кострома, город Кострома, улица Дзержинского, дом 17/11</p>
        <h2>Контактные телефоны:</h2>
          <ul>
            {contacts.map((contact, index) => (
              <li key={index}>
                {contact.numbers.join(' / ')} - {contact.description}
              </li>
            ))}
          </ul>
        <p></p>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="social-icons">
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer"><FaVk size={24} /></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer"><FaTelegram size={24} /></a>
          </div>
          <div className="address">
            <p>Адрес: г. Кострома, ул. Ивановская, д. 24а</p>
            <p>Политика конфиденциальности</p>
          </div>
          <div className="contact-info">
            <p>156005, Костромская область, городской округ город Кострома, город Кострома, улица Дзержинского, дом 17/11</p>
            <p>Тел. +7 (4942) 63-49-00 (доб. 1010) (ректорат), +7 (4942) 63-49-00 (доб. 644) (приемная комиссия)</p>
          </div>
        </div>
      </footer>
    </>
  );
};
