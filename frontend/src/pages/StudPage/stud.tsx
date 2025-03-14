import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import './stud.css';

export const Stud = () =>{
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

        <div className="abitur-container">
            <h2>Студенту</h2>
            
            <section className="admission-conditions">
                <h3>Условия поступления</h3>
                <p>Поступление в Высшую ИТ-Школу осуществляется на основе результатов ЕГЭ или внутренних экзаменов.</p>
            </section>

            <section className="documents-required">
                <h3>Необходимые документы</h3>
                <ul>
                    <li>Паспорт</li>
                    <li>Аттестат о среднем образовании</li>
                    <li>Сертификат ЕГЭ</li>
                    <li>Медицинская справка</li>
                    <li>Фотографии 3x4 (4 шт.)</li>
                </ul>
            </section>

            <section className="admission-deadlines">
                <h3>Сроки подачи документов</h3>
                <p>Прием документов начинается с 1 июня и заканчивается 31 июля.</p>
            </section>

            <section className="benefits">
                <h3>Почему стоит выбрать нас?</h3>
                <ul>
                    <li>Современные учебные программы</li>
                    <li>Преподаватели с опытом в IT-индустрии</li>
                    <li>Практика в ведущих IT-компаниях</li>
                    <li>Гарантированное трудоустройство лучших выпускников</li>
                </ul>
            </section>
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