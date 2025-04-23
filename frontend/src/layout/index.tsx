// components/Layout.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { FaVk, FaTelegram } from "react-icons/fa";

// Интерфейсы можно вынести в отдельный файл types.ts
interface UserData {
  username: string;
}

export const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      axios.get("https://tamik327.pythonanywhere.com/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => setUserData(response.data))
      .catch(console.error);
    }
  }, []);

  return (
      <header className="header">
      {/* Логотип и название */}
      <div className="logo">
        <div className="img_logo">
          <img src="/logo.svg" alt="Логотип" />
        </div>
        <div className="text_logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Высшая ИТ-Школа</h1>
          </Link>
        </div>
      </div>

      {/* Десктопная навигация */}
      <nav className="nav">
        <ul>
          <li><Link to="/about">Сведения об организации</Link></li>
          <li><Link to="/abitur">Абитуриенту</Link></li>
          <li><Link to="/stud">Студенту</Link></li>
          <li><Link to="/lifeinst">Жизнь института</Link></li>
          <li><Link to="/museum">Музей</Link></li>
        </ul>
      </nav>

      {/* Правая часть шапки */}
      <div className="header-right">
        {/* Десктопная кнопка входа */}
        {!isAuthenticated && (
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
          >
            Войти
          </button>
        )}

        {/* Бургер-кнопка */}
        <button 
          className="burger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Меню"
        >
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
        </button>

        {/* Панель пользователя для десктопа */}
        {isAuthenticated && (
          <div className="user-panel">
            <div className="user-main-info">
              <div className="avatar-container">
                <img 
                  src="/default_avatar.jpg" 
                  alt="Аватар"
                  className="user-avatar"
                />
              </div>
              <span className="username">
                {userData?.username || "Загрузка..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ul>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>Сведения об организации</Link></li>
              <li><Link to="/abitur" onClick={() => setIsMenuOpen(false)}>Абитуриенту</Link></li>
              <li><Link to="/stud" onClick={() => setIsMenuOpen(false)}>Студенту</Link></li>
              <li><Link to="/lifeinst" onClick={() => setIsMenuOpen(false)}>Жизнь института</Link></li>
              <li><Link to="/museum" onClick={() => setIsMenuOpen(false)}>Музей</Link></li>
              
              {/* Мобильная кнопка входа */}
              {!isAuthenticated ? (
                <li>
                  <button 
                    className="mobile-login-btn"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Войти
                  </button>
                </li>
              ) : (
                <li className="mobile-user-info">
                  <div className="mobile-avatar">
                    <img 
                      src="public/default_avatar.jpg" 
                      alt="Аватар"
                    />
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-username">{userData?.username}</span>
                    <button 
                      className="mobile-logout"
                      onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        setIsAuthenticated(false);
                      }}
                    >
                      Выйти
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="footer">
        <div className="footer-content">
        <div className="social-icons">
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer"><FaVk size={36} /></a>
            <a href="https://t.me" target="_blank" rel="noopener noreferrer"><FaTelegram size={36} /></a>
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
  );
};

// Вариант с общим Layout компонентом
export const Layout = () => {
  return (
    <>
      <Header />
      <main style={{display:"flex", flexGrow:1, flexDirection:"column"}}>{<Outlet/>}</main>
      <Footer />
    </>
  );
};

