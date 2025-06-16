import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaVk, FaTelegram, FaChevronDown, FaChevronUp, FaUser, FaSignOutAlt, FaUsersCog, FaCog, FaFileAlt } from "react-icons/fa";
import { useAuth, AuthProvider } from "../Context/AuthContext";
import './index.css';

interface ExpandedSections {
  profile: boolean;
}

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData, logout, checkAuth } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    profile: false
  });

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const burgerMenuRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  const isAdmin = userData?.role === "admin";
  const isModerator = userData?.role === "moderator";

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }

      if (isMenuOpen &&
        burgerMenuRef.current && !burgerMenuRef.current.contains(event.target as Node) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const handleAdminPanelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUserDropdownOpen(false);
    setIsMenuOpen(false);
    navigate("/adminpanel");
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("#");
  };

  const renderUserDropdown = () => (
    <motion.div
      className="user-dropdown"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="dropdown-content">
        <Link to="/personalaccount" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
          <FaUser className="dropdown-icon" />
          <span>Личный кабинет</span>
        </Link>
        <Link 
          to={isAdmin ? "/adminstatements" : "/statements"} 
          className="dropdown-item" 
          onClick={() => setIsUserDropdownOpen(false)}
        >
          <FaFileAlt className="dropdown-icon" />
          <span>{isAdmin ? "Заявки" : "Мои заявления"}</span>
        </Link>
        {(isAdmin || isModerator) && (
          <Link to="/adminpanel" className="dropdown-item" onClick={handleAdminPanelClick}>
            <FaUsersCog className="dropdown-icon" />
            <span>Управление пользователями</span>
          </Link>
        )}
        <Link to="#" className="dropdown-item" onClick={handleSettingsClick}>
          <FaCog className="dropdown-icon" />
          <span>Настройки</span>
        </Link>
        <div className="dropdown-item" onClick={handleLogout}>
          <FaSignOutAlt className="dropdown-icon" />
          <span>Выйти</span>
        </div>
      </div>
    </motion.div>
  );

  const renderMobileUserMenu = () => (
    <li className="mobile-section">
      <div 
        className="mobile-section-header"
        onClick={() => setExpandedSections(prev => ({
          ...prev,
          profile: !prev.profile
        }))}
      >
        <div className="mobile-user-preview">
          <div className="mobile-avatar">
            <img src={userData?.vk_avatar || '/default_avatar.jpg'} alt="Аватар" />
          </div>
          <span className="mobile-username">{userData?.username}</span>
        </div>
        {expandedSections.profile ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      <AnimatePresence>
        {expandedSections.profile && (
          <motion.div
            className="mobile-profile-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to="/personalaccount"
              className="mobile-profile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUser className="mobile-link-icon" />
              Личный кабинет
            </Link>
            <Link
              to={isAdmin ? "/adminstatements" : "/statements"}
              className="mobile-profile-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaFileAlt className="mobile-link-icon" />
              {isAdmin ? "Заявки" : "Мои заявления"}
            </Link>
            {(isAdmin || isModerator) && (
              <Link
                to="/adminpanel"
                className="mobile-profile-link"
                onClick={handleAdminPanelClick}
              >
                <FaUsersCog className="mobile-link-icon" />
                Управление пользователями
              </Link>
            )}
            <div
              className="mobile-profile-link"
              onClick={handleSettingsClick}
            >
              <FaCog className="mobile-link-icon" />
              Настройки
            </div>
            <button
              className="mobile-logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="mobile-link-icon" />
              Выйти
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );

  return (
    <header className="header">
      <div className="logo">
        <div className="img_logo">
          <img src='/logo.svg' alt="Логотип" />
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
          <div className="desktop-only">
            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Войти
            </button>
          </div>
        ) : (
          <div className="user-panel" ref={userDropdownRef}>
            <div
              className="user-main-info"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div className="avatar-container">
                <img
                  src={userData?.vk_avatar || '/default_avatar.jpg'}
                  alt="Аватар"
                  className="user-avatar"
                />
              </div>
              <div className="user-details">
                <span className="username">{userData?.username}</span>
                {isUserDropdownOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
            </div>

            {isUserDropdownOpen && renderUserDropdown()}
          </div>
        )}
      </div>

      <button
        className="burger-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Меню"
        ref={burgerMenuRef}
      >
        <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
        <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
        <div className={`burger-line ${isMenuOpen ? "open" : ""}`} />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="mobile-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            ref={mobileMenuRef}
          >
            <ul>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>Сведения об организации</Link></li>
              <li><Link to="/abitur" onClick={() => setIsMenuOpen(false)}>Абитуриенту</Link></li>
              <li><Link to="/stud" onClick={() => setIsMenuOpen(false)}>Студенту</Link></li>
              <li><Link to="/lifeinst" onClick={() => setIsMenuOpen(false)}>Жизнь института</Link></li>
              <li><Link to="/museum" onClick={() => setIsMenuOpen(false)}>Музей</Link></li>

              {isAuthenticated ? renderMobileUserMenu() : (
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
    <AuthProvider>
      <Header />
      <main style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <Outlet />
      </main>
      <Footer />
    </AuthProvider>
  );
};