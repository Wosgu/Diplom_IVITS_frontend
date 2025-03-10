import { useNavigate } from 'react-router-dom'; // Подключаем навигацию
import { FaVk, FaTelegram } from 'react-icons/fa'; // Иконки соц.сетей
import './index.css';  

export const MainPage = () => {
    const navigate = useNavigate(); // Используем хук useNavigate
  
    const handleLoginClick = () => {
      navigate('/login'); // Переход на страницу /login
    };
  
    return (
      <>
        <header className="header">
          <div className="logo">
            <h1>Высшая ИТ-Школа</h1>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="#home">Сведения об организации</a></li>
              <li><a href="#about">Абитуриенту</a></li>
              <li><a href="#services">Студенту</a></li>
              <li><a href="#contact">Жизнь института</a></li>
              <li><a href="#contact">Музей</a></li>
            </ul>
          </nav>
          <button className="login-btn" onClick={handleLoginClick}>Войти</button>
        </header>
  
        <footer className="footer">
          <div className="footer-content">
            <div className="social-icons">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer">
                <FaVk size={24} />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                <FaTelegram size={24} />
              </a>
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
  }
