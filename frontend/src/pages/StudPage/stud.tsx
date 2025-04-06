import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import axios from 'axios';
import './stud.css';

// Интерфейс для новости
interface NewsItem {
    id: number;
    title: string;
    content: string;
    images: Array<{
      id: number;
      image: string; // URL изображения
    }>;
    created_at: string;
    updated_at: string;
    is_published: boolean;
    author: {
      id: number;
      username: string;
      email: string;
    };
    category: number;
    tags: number[];
    comments_count: number;
    likes_count: number;
}

export const Stud = () =>{
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsItem[]>([]); // Состояние для хранения новостей
    const [loading, setLoading] = useState(true); // Состояние для загрузки
    const [error, setError] = useState<string | null>(null); // Состояние для ошибок

      // Загрузка новостей с бэкенда
    useEffect(() => {
        axios.get<NewsItem[]>("https://tamik327.pythonanywhere.com/api/news/")
        .then(response => {
            const category2News = response.data.filter(item => item.category === 2);
            setNews(category2News);
            setLoading(false);
        })
        .catch(error => {
            console.error("Ошибка при получении новостей:", error);
            setError("Не удалось загрузить новости. Пожалуйста, попробуйте позже.");
            setLoading(false);
        });
    }, []);
    // Функция для получения первого изображения
    const getFirstImageUrl = (images: Array<{ id: number; image: string }>): string => {
        if (images.length > 0) {
        return images[0].image; // Возвращаем URL первого изображения
        }
        return "/path/to/placeholder/image.png"; // Возвращаем URL заглушки, если изображений нет
    };

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

        <div className='main-container'>
            <div className='welcome-container'>Добро пожаловать, Гость!</div>
            <div className='nav-btn'>
                <button className='btn-selection'>Студенческая Жизнь</button>
                <button className='btn-selection'>Личный кабинет</button>
                <button className='btn-selection'>салфетка 3</button>
                <button className='btn-selection'>салфетка 4</button>
                <button className='btn-selection'>салфетка 5</button>
            </div>
            <div className='heading-container'>
                <div className='container-content'>
                    <div className='novost-items'>
                    {loading ? (
                    <p>Загрузка новостей...</p>
                    ) : error ? (
                    <p>{error}</p>
                    ) : (
                    news.map((item) => ( 
                        <div className='novost-item' key={item.id}>
                        <img
                            src={getFirstImageUrl(item.images)} // Используем функцию для получения первого изображения
                            alt={item.title}
                        />
                        <div className="novost-item-content">
                            <h3>{item.title}</h3>
                            <p>{item.content}</p>
                        </div>
                        </div>
                    ))
                    )}
                </div>
                </div>
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