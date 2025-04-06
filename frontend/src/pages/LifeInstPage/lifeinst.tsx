// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation} from 'swiper/modules';
import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram, FaRegThumbsUp, FaRegComment, FaRegShareSquare } from "react-icons/fa";
import axios from 'axios';
import './lifeinst.css';

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

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Comment {
  id: number;
  text: string;
  created_at: string;
  author: {
    username: string;
    avatar?: string;
  };
}

export const Lifeinst = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNews, setExpandedNews] = useState<{ [key: number]: boolean }>({});
  const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [newsId: number]: Comment[] }>({});
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsResponse, categoriesResponse] = await Promise.all([
          axios.get<NewsItem[]>("https://tamik327.pythonanywhere.com/api/news/"),
          axios.get<Category[]>("https://tamik327.pythonanywhere.com/api/categories/")
        ]);
        
        setNews(newsResponse.data);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Неизвестная категория';
  };

  const filteredNews = selectedCategories.length > 0
    ? news.filter(item => selectedCategories.includes(item.category))
    : news;

  useEffect(() => {
    if (news.length === 0) return;
    
    const mockComments: Comment[] = [
      {
        id: 1,
        text: 'Это пример комментария. Очень интересная новость!',
        created_at: '2024-03-20T10:00:00Z',
        author: {
          username: 'user1',
          avatar: 'https://via.placeholder.com/40',
        },
      },
      {
        id: 2,
        text: 'Еще один комментарий. Спасибо за информацию!',
        created_at: '2024-03-20T11:30:00Z',
        author: {
          username: 'user2',
        },
      },
      {
        id: 3,
        text: 'И еще один пример комментария для демонстрации.',
        created_at: '2024-03-20T12:45:00Z',
        author: {
          username: 'user3',
          avatar: 'https://via.placeholder.com/40',
        },
      },
      {
        id: 4,
        text: 'И еще один пример комментария для демонстрации.',
        created_at: '2024-03-20T12:45:00Z',
        author: {
          username: 'user3',
          avatar: 'https://via.placeholder.com/40',
        },
      }
    ];

    const initialComments = news.reduce((acc, item) => {
      acc[item.id] = mockComments;
      return acc;
    }, {} as { [key: number]: Comment[] });
    
    setComments(initialComments);
  }, [news]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleExpand = (newsId: number) => {
    setExpandedNews(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }));
  };

  const toggleShowAllComments = (newsId: number) => {
    setShowAllComments(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }));
  };

  const handleNextImage = (newsId: number, imagesLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [newsId]: (prev[newsId] || 0) < imagesLength - 1 ? (prev[newsId] || 0) + 1 : 0
    }));
  };

  const handlePrevImage = (newsId: number, imagesLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [newsId]: (prev[newsId] || 0) > 0 ? (prev[newsId] || 0) - 1 : imagesLength - 1
    }));
  };
  const renderImages = (newsId: number, images: NewsItem['images']) => {
    if (images.length === 0) {
      return (
        <img
          src="https://via.placeholder.com/150"
          alt="Заглушка"
          className="single-image"
        />
      );
    }
  
    if (images.length === 1) {
      return (
        <img
          src={images[0].image}
          alt={images[0].id.toString()}
          className="single-image"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/800x400';
            e.currentTarget.alt = 'Ошибка загрузки';
          }}
        />
      );
    }
  
    const currentIndex = currentImageIndex[newsId] || 0;
  
    return (
      <div className="custom-slider">
        <div className="slider-images">
          {images.map((image, index) => (
            <img
              key={image.id}
              src={image.image}
              alt={image.id.toString()}
              className={`news-image ${index === currentIndex ? 'active' : ''}`}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x400';
                e.currentTarget.alt = 'Ошибка загрузки';
              }}
            />
          ))}
        </div>
        
        <div className="slider-controls">
          <button 
            className="slider-arrow prev"
            onClick={() => handlePrevImage(newsId, images.length)}
          >
            ‹
          </button>
          <button 
            className="slider-arrow next"
            onClick={() => handleNextImage(newsId, images.length)}
          >
            ›
          </button>
        </div>
        
        <div className="slider-dots">
          {images.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(prev => ({
                ...prev,
                [newsId]: index
              }))}
            />
          ))}
        </div>
      </div>
    );
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

      <div className="life-ivits-container">
        <h2>Жизнь института</h2>
        <div className='novost-ivits'>
          <div className='checkbox-novosti'>
            <h4>Фильтр по категориям</h4>
            {categories.map(category => (
              <label className="checkbox-label" key={category.id}>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
                <span className="checkbox-custom"></span>
                {category.name}
              </label>
            ))}
          </div>
          <div className='novost-items'>
            {loading ? (
              <p>Загрузка новостей...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              filteredNews.map((item) => {
                const maxLength = 200;
                const needsTruncation = item.content.length > maxLength;
                const displayedContent = expandedNews[item.id] 
                  ? item.content 
                  : `${item.content.slice(0, maxLength)}${needsTruncation ? '...' : ''}`;

                return (
                  <div className='novost-item' key={item.id}>
                    <div className="novost-item-header">
                    <div className="image-container">
                  {renderImages(item.id, item.images)}
                </div>
                      <div className="title-date">
                        <h3>{item.title}</h3>
                        <p className="publish-date">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="tags">
                      <span className="tag">
                        {getCategoryName(item.category)}
                      </span>
                    </div>

                    <div className="novost-item-content">
                      <p>
                        {displayedContent}
                        {needsTruncation && (
                          <button 
                            onClick={() => toggleExpand(item.id)}
                            className="expand-btn"
                          >
                            {expandedNews[item.id] ? 'Свернуть' : 'Подробнее'}
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="interactions">
                      <div className="interaction-item">
                        <FaRegThumbsUp />
                        <span>{item.likes_count}</span>
                      </div>
                      <div className="interaction-item">
                        <FaRegComment />
                        <span>{item.comments_count}</span>
                      </div>
                      <div className="interaction-item">
                        <FaRegShareSquare />
                        <span>0</span>
                      </div>
                    </div>

                    <div className="comments-section">
                      {comments[item.id]?.slice(0, showAllComments[item.id] ? undefined : 3)
                        .map(comment => (
                          <div className="comment" key={comment.id}>
                            <img
                              src={comment.author.avatar || 'https://via.placeholder.com/40'}
                              alt="Аватар"
                              className="comment-avatar"
                            />
                            <div className="comment-content">
                              <div className="comment-header">
                                <span className="username">
                                  {comment.author.username}
                                </span>
                                <span className="comment-date">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      
                      {item.comments_count > 3 && (
                        <button
                          className="show-comments-btn"
                          onClick={() => toggleShowAllComments(item.id)}
                        >
                          {showAllComments[item.id] 
                            ? 'Скрыть комментарии' 
                            : 'Показать все комментарии'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
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