import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import './museum.css';

export const Museum = () =>{
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
        <h1 className='museum-h1'>Музей</h1>
        <div className='museum-expo'>
            <div className="museum-list">
                    <input className="search-bar-input" placeholder="Поиск..." />
                <div className="exhibits">
                    {/* Добавьте элементы экспонатов здесь */}
                    <div className="exhibit">Экспонат 1</div>
                    <div className="exhibit">Экспонат 2</div>
                    <div className="exhibit">Экспонат 3</div>
                    <div className="exhibit">Экспонат 4</div>
                    <div className="exhibit">Экспонат 5</div>
                </div>
            </div>

            <div className="expo-info">
                <h2 className='h2-expo'>Информация об экспонате</h2>
                <img className='image-expo' src='frontend\src\assets\meme.jpeg'/>
                <p className='description-expo'>Описание экспоната. Здесь можно разместить текст, который описывает выбранный экспонат.</p>
            </div>
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