import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaVk, FaTelegram } from "react-icons/fa";
import axios from "axios";
import "./index.css";

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

export const MainPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
    }

    // Запрос к бэкенду для получения новостей
    axios.get<NewsItem[]>("http://26.43.50.46:8000/api/news/")
      .then(response => {
        setNews(response.data);
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
        {!isAuthenticated && (
          <button className="login-btn" onClick={() => navigate("/login")}>Войти</button>
        )}
      </header>

      <div className="main-index">
        <div className="banner">
          <img src="/src/assets/banner_primer.jpg" alt="Banner" />
        </div>
        <div className="index-info">
          <div className="rolikvits">
            <iframe src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" allow="autoplay; encrypted-media" title="Video"></iframe>
          </div>
          <div className="info-ivits-small">
            <h2 className="nov_ivits">Актуальные новости Института Высшей ИТ-Школы!</h2>
            {loading ? (
              <p>Загрузка новостей...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              news.slice(-3).map((item) => ( // Выводим только последние 3 новости
                <div className="small-inf0-1" key={item.id}>
                  <img
                    src={getFirstImageUrl(item.images)} // Всегда возвращает строку
                    alt={item.title}
                  />
                  <div className="name-descr">
                    <p className="named-info">{item.title}</p>
                    <p className="description-info">{item.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <h3 className="programm-h">Программы обучения</h3>
        <div className="programm-training">
          <div className="prorgam-test1">
            <img src="src/assets/govno_peredelyvay.gif" alt="Program 1" />
            <div className="name-descr">
              <p className="named-info">Программа 1</p>
              <p className="description-info">А это описание к новости</p>
            </div>
          </div>
          <div className="prorgam-test1">
            <img src="src/assets/govno_peredelyvay.gif" alt="Program 2" />
            <div className="name-descr">
              <p className="named-info">Программа 2</p>
              <p className="description-info">А это описание к новости</p>
            </div>
          </div>
          <div className="prorgam-test1">
            <img src="src/assets/govno_peredelyvay.gif" alt="Program 3" />
            <div className="name-descr">
              <p className="named-info">Программа 3</p>
              <p className="description-info">А это описание к новости</p>
            </div>
          </div>
          <div className="prorgam-test1">
            <img src="src/assets/govno_peredelyvay.gif" alt="Program 4" />
            <div className="name-descr">
              <p className="named-info">Программа 4</p>
              <p className="description-info">А это описание к новости</p>
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