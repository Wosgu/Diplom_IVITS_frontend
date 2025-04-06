import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaVk, FaTelegram } from "react-icons/fa";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  images: Array<{
    id: number;
    image: string;
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

interface SliderItem {
  id: number;
  imageUrl: string;
  description: string;
}

interface TestimonialItem {
  id: number;
  author: string;
  text: string;
  role: string;
  photo: string;
}

interface Program {
  id: number;
  code: string;
  name: string;
  program_name: string;
  form: string;
  description: string;
  images: Array<{
    id: number;
    image: string;
  }>;
  department: {
    id: number;
    name: string;
  };
  level: {
    id: number;
    name: string;
    code: string;
  };
}

interface EducationLevel {
  id: number;
  name: string;
  code: string;
  programs: Program[];
}

export const MainPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlashka, setCurrentPlashka] = useState(0);
  const [currentSlideIndex] = useState(0);
  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ username: string } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [prevDragOffset, setPrevDragOffset] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [bannerDragStart, setBannerDragStart] = useState(0);
  const bannerImages = [
    "/banner_primer.jpg",
    "/banner_primer1.jpg",
    "/banner_primer3.jpg"
  ];

  const handleBannerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setBannerDragStart(clientX);
  };

  const handleBannerDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const dragEnd = clientX;
    const dragDistance = bannerDragStart - dragEnd;

    if (Math.abs(dragDistance) > 50) {
      setCurrentBannerSlide(prev => 
        dragDistance > 0 
          ? (prev + 1) % bannerImages.length
          : (prev - 1 + bannerImages.length) % bannerImages.length
      );
    }
  };

  const [testimonialDragStart, setTestimonialDragStart] = useState(0);
  const handleTestimonialDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTestimonialDragStart(clientX);
  };

  const handleTestimonialDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const dragEnd = clientX;
    const dragDistance = testimonialDragStart - dragEnd;

    if (Math.abs(dragDistance) > 50) {
      setCurrentTestimonial(prev => 
        dragDistance > 0 
          ? (prev + 1) % testimonialsData.length
          : (prev - 1 + testimonialsData.length) % testimonialsData.length
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
      axios.get("https://tamik327.pythonanywhere.com/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Ошибка получения данных пользователя:", error);
      });
    }

    axios.get<NewsItem[]>("https://tamik327.pythonanywhere.com/api/news/")
      .then(response => {
        // Сортировка и выборка на фронтенде
        const sortedNews = response.data
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, 3); // Берем первые 3 после сортировки
        
        setNews(sortedNews);
        setLoading(false);
      })
      .catch(error => {
        console.error("Ошибка при получении новостей:", error);
        setError("Не удалось загрузить новости. Пожалуйста, попробуйте позже.");
        setLoading(false);
      });

    axios.get<Program[]>("https://tamik327.pythonanywhere.com/api/programs/")
      .then(response => {
        const programs = response.data;
        const levelsMap = new Map<string, EducationLevel>();
        
        programs.forEach(program => {
          const level = program.level;
          if (!levelsMap.has(level.code)) {
            levelsMap.set(level.code, {
              id: level.id,
              name: level.name,
              code: level.code,
              programs: []
            });
          }
          levelsMap.get(level.code)?.programs.push(program);
        });
        
        setEducationLevels(Array.from(levelsMap.values()));
        setProgramsError(null);
      })
      .catch(error => {
        console.error("Ошибка при загрузке программ:", error);
        setProgramsError("Не удалось загрузить программы обучения. Пожалуйста, попробуйте позже.");
      });
  }, []);

  const switchPlashka = (index: number) => {
    setCurrentPlashka(index);
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragStartX(clientX);
    setPrevDragOffset(dragOffset);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = clientX - dragStartX;
    const newOffset = prevDragOffset + distance;
  
    const containerWidth = sliderRef.current?.offsetWidth || 0;
    const sliderWidth = containerWidth * (sliderItems.length / 3);
    const maxOffset = containerWidth - sliderWidth + (containerWidth * 0);
  
    setDragOffset(Math.min(Math.max(newOffset, maxOffset), 0));
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setPrevDragOffset(dragOffset);
  };

  const getFirstImageUrl = (images: Array<{ id: number; image: string }>): string => {
    return images.length > 0 ? images[0].image : "/path/to/placeholder/image.png";
  };

  const testimonialsData: TestimonialItem[] = [
    {
      id: 1,
      author: "Иван Петров",
      role: "Выпускник 2020",
      text: "Отличная программа обучения, современные технологии и профессиональные преподаватели.",
      photo: "/rabota.png"
    },
    {
      id: 2,
      author: "Мария Сидорова",
      role: "Студентка 3 курса",
      text: "Прекрасные возможности для практики и участия в реальных проектах.",
      photo: "/rabota.png"
    },
    {
      id: 3,
      author: "Алексей Иванов",
      role: "Родитель студента",
      text: "Вижу прогресс в знаниях ребенка, благодарен преподавательскому составу.",
      photo: "/rabota.png"
    }
  ];

  const sliderItems: SliderItem[] = [
    {
      id: 1,
      imageUrl: "/mfti.png",
      description: "День открытых дверей 2023"
    },
    {
      id: 2,
      imageUrl: "/mfti.png",
      description: "Хакатон по веб-разработке"
    },
    {
      id: 3,
      imageUrl: "/mfti.png",
      description: "Конференция по искусственному интеллекту"
    },
    {
      id: 4,
      imageUrl: "/mfti.png",
      description: "День открытых дверей 2023"
    },
    {
      id: 5,
      imageUrl: "/mfti.png",
      description: "Хакатон по веб-разработке"
    },
    {
      id: 6,
      imageUrl: "/mfti.png",
      description: "Конференция по искусственному интеллекту"
    }
  ];

  return (
    <>
      <header className="header">
        {/* Логотип и название */}
        <div className="logo">
          <div className="img_logo">
            <img src="/logo.png" alt="Логотип" />
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
                    src="/default-avatar.png" 
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
                        src="/default-avatar.png" 
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
      <div className="fade-slider"
          onMouseDown={handleBannerDragStart}
          onMouseUp={handleBannerDragEnd}
          onTouchStart={handleBannerDragStart}
          onTouchEnd={handleBannerDragEnd}>
          <div className="fade-slider__container">
            {bannerImages.map((img, index) => (
              <div 
                key={index}
                className={`fade-slider__item ${index === currentBannerSlide ? 'is-active' : ''}`}
              >
                <img src={img} alt={`Slide ${index + 1}`} className="fade-slider__image" />
              </div>
            ))}
          </div>
          <div className="fade-slider__dots">
            {bannerImages.map((_, index) => (
              <button
                key={index}
                className={`fade-slider__dot ${index === currentBannerSlide ? 'is-selected' : ''}`}
                onClick={() => setCurrentBannerSlide(index)}
              />
            ))}
          </div>
        </div>
      <div className="main-index">


        <div className="index-info">
          <div className="rolikvits">
            <iframe src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" 
                    allow="autoplay; encrypted-media" 
                    title="Video"></iframe>
          </div>
          <div className="info-ivits-small">
            <h2 className="nov_ivits">Актуальные новости Института Высшей ИТ-Школы!</h2>
            {loading ? (
              <div className="news-loading">Загрузка новостей...</div>
            ) : error ? (
              <div className="news-error-message">
                ⚠️ {error}
              </div>
            ) : (
              <div className="news-grid">
                {news.map((item) => (
                  <div className="news-card" key={item.id} onClick={() => navigate("/lifeinst")}>
                    <div className="news-image-wrapper">
                      <img
                        src={getFirstImageUrl(item.images)}
                        alt={item.title}
                        className="news-image"
                      />
                      <div className="news-title-overlay">
                        <h3 className="news-title">{item.title}</h3>
                      </div>
                    </div>
                    <div className="news-content">
                      <div className="tags-container">
                        {item.tags.map((tagId) => (
                          <span key={tagId} className="news-tag">#{tagId}</span>
                        ))}
                      </div>
                      <p className="news-excerpt">{item.content.slice(0, 120)}...</p>
                      <div className="news-date">
                        {new Date(item.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <h3 className="programm-h">Программы обучения</h3>
        <div className="programm-training">
          {programsError ? (
            <div className="error-message">
              ⚠️ {programsError}
            </div>
          ) : (
            <>
              <div className="plashka-container">
                {educationLevels.map((level, index) => (
                  <div
                    key={level.id}
                    className={`plashka ${currentPlashka === index ? "active" : ""}`}
                    onClick={() => switchPlashka(index)}
                  >
                    <div className="plashka-title">{level.name}</div>
                  </div>
                ))}
              </div>
              {educationLevels.length > 0 && (
                <div className="info-block">
                  <div className="program-info">
                    {educationLevels[currentPlashka].programs[0]?.images?.length > 0 && (
                      <img
                        src={getFirstImageUrl(educationLevels[currentPlashka].programs[0].images)}
                        alt="Программа"
                        className="program-image"
                      />
                    )}
                    <div className="program-details">
                      <h4>{educationLevels[currentPlashka].programs[0]?.program_name}</h4>
                      <p>{educationLevels[currentPlashka].programs[0]?.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="slider-section">
          <h3 className="slider-title">Наши достижения</h3>
          <div 
            className="slider-wrapper"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div 
              className="slider"
              ref={sliderRef}
              style={{
                transform: `translateX(calc(-${currentSlideIndex * 33.333}% + ${dragOffset}px))`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {sliderItems.map((item) => (
                <div key={item.id} className="slide">
                  <div className="slide-image"><img src={item.imageUrl} alt={item.description}/></div>
                  <div className="slide-caption">
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="testimonials-section"
          onMouseDown={handleTestimonialDragStart}
          onMouseUp={handleTestimonialDragEnd}
          onTouchStart={handleTestimonialDragStart}
          onTouchEnd={handleTestimonialDragEnd}>
          <h3 className="section-title">Отзывы студентов</h3>
          <div className="testimonials-slider">
            <div 
              className="slider-container"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonialsData.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="testimonial-card"
                >
                  <div className="author-photo">
                    <img src={testimonial.photo} alt={testimonial.author} />
                  </div>
                  <div className="testimonial-content">
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.author}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="slider-controls">
              <button 
                className="arrow prev"
                onClick={() => setCurrentTestimonial(prev => prev > 0 ? prev - 1 : testimonialsData.length - 1)}
              >‹</button>
              <div className="dots-container">
                {testimonialsData.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
              <button 
                className="arrow next"
                onClick={() => setCurrentTestimonial(prev => (prev + 1) % testimonialsData.length)}
              >›</button>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};