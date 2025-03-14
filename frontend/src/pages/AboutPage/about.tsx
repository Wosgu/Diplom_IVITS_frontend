import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import './about.css';

export const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="header">
        <div className="logo">
          <h1>Высшая ИТ-Школа</h1>
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
        <h2>О нашем институте</h2>
        <p>Высшая ИТ-Школа — это современный образовательный центр, готовящий специалистов в сфере информационных технологий.</p>

        <h3>Наши направления:</h3>
        <ul>
          <li>Разработка программного обеспечения</li>
          <li>Кибербезопасность</li>
          <li>Сетевые технологии</li>
          <li>Искусственный интеллект</li>
        </ul>

        <h3>Почему выбирают нас?</h3>
        <p>Наши преподаватели — эксперты в своих областях, а студенты получают не только теоретические знания, но и практические навыки.</p>
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
