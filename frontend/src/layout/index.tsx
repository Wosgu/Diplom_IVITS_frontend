// components/Layout.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { FaVk, FaTelegram, FaChevronDown, FaChevronUp, FaUser, FaSignOutAlt } from "react-icons/fa";
import './index.css';

interface UserData {
  username: string;
  email: string;
  role: string;
  groups: number[];
}

export const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      axios.get("http://tamik327.pythonanywhere.com/api/users/me/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUserData(null);
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
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

      <nav className="nav">
        <ul>
          <li><Link to="/about">Сведения об организации</Link></li>
          <li><Link to="/abitur">Абитуриенту</Link></li>
          <li><Link to="/stud">Студенту</Link></li>
          <li><Link to="/lifeinst">Жизнь института</Link></li>
          <li><Link to="/museum">Музей</Link></li>
        </ul>
      </nav>

      <div className="header-right">
        {!isAuthenticated ? (
          <button 
            className="login-btn" 
            onClick={() => navigate("/login")}
          >
            Войти
          </button>
        ) : (
          <div className="user-panel">
            <div 
              className="user-main-info"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div className="avatar-container">
                <img 
                  src="/default_avatar.jpg" 
                  alt="Аватар"
                  className="user-avatar"
                />
              </div>
              <div className="user-details">
                <span className="username">{userData?.username}</span>
                {isUserDropdownOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </div>

            {isUserDropdownOpen && (
              <motion.div 
                className="user-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="dropdown-content">
                  <Link 
                    to="/personalaccount" 
                    className="dropdown-item"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <FaUser className="dropdown-icon" />
                    <span>Личный кабинет</span>
                  </Link>
                  <div 
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Выйти</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <button 
          className="burger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Меню"
        >
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
          <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
        </button>
      </div>

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
              
              {isAuthenticated ? (
                <li className="mobile-user-info">
                  <div className="mobile-avatar">
                    <img 
                      src="/default_avatar.jpg" 
                      alt="Аватар"
                    />
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-username">{userData?.username}</span>
                    <Link 
                      to="/personalaccount" 
                      className="mobile-profile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Личный кабинет
                    </Link>
                    <button 
                      className="mobile-logout"
                      onClick={handleLogout}
                    >
                      Выйти
                    </button>
                  </div>
                </li>
              ) : (
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
          <a href="https://vk.com" target="_blank" rel="noopener noreferrer">
            <FaVk size={36} />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <FaTelegram size={36} />
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
  );
};

export const Layout = () => {
  return (
    <>
      <Header />
      <main style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};