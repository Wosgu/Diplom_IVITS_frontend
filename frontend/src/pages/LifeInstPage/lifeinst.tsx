import { useState, useEffect } from "react";
import { FaRegThumbsUp, FaRegComment } from "react-icons/fa";
import axios from 'axios';
import { Addnews } from "./addnews";
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
  news: number;
  author: {
    username: string;
    avatar?: string;
  };
}

export const Lifeinst = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNews, setExpandedNews] = useState<{ [key: number]: boolean }>({});
  const [showAllComments, setShowAllComments] = useState<{ [key: number]: boolean }>({});
  const [comments, setComments] = useState<{ [newsId: number]: Comment[] }>({});
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState<{ [key: number]: number }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [showAddNews, setShowAddNews] = useState(false);

  const fetchData = async () => {
    try {
      const [newsResponse, categoriesResponse] = await Promise.all([
        axios.get<{ results: NewsItem[] }>("https://tamik327.pythonanywhere.com/api/news/"),
        axios.get<{ results: Category[] }>("https://tamik327.pythonanywhere.com/api/categories/")
      ]);

      setNews(newsResponse.data.results);
      setCategories(categoriesResponse.data.results);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCommentsForNews = async () => {
      const token = localStorage.getItem('accessToken');
      const commentsMap: { [key: number]: Comment[] } = {};

      await Promise.all(
        news.map(async (item) => {
          try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get<{
              count: number;
              results: Comment[];
            }>(`https://tamik327.pythonanywhere.com/api/comments/?news=${item.id}`, config);

            commentsMap[item.id] = response.data.results.filter(c => c.news === item.id);
          } catch (error) {
            console.error(`Ошибка загрузки комментариев для новости ${item.id}:`, error);
            commentsMap[item.id] = [];
          }
        })
      );

      setComments(commentsMap);
    };

    if (news.length > 0) fetchCommentsForNews();
  }, [news]);

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
    ? news.filter((item: NewsItem) => selectedCategories.includes(item.category))
    : news;

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

  const handleImageSwap = (newsId: number, clickedIndex: number) => {
    setCurrentMainImageIndex(prev => ({
      ...prev,
      [newsId]: clickedIndex
    }));
  };

  const renderImageCollage = (newsId: number, images: NewsItem['images']) => {
    if (images.length === 0) {
      return <img src="/default_news.jpg" alt="Заглушка" className="single-image" />;
    }

    const mainIndex = currentMainImageIndex[newsId] || 0;
    return (
      <div className="image-collage">
        <div className="main-image-container">
          <img
            src={images[mainIndex].image}
            alt={`Main-${images[mainIndex].id}`}
            className="main-image"
          />
        </div>
        {images.length > 1 && (
          <div className="side-images">
            {images.filter((_, i) => i !== mainIndex).map((image, index) => (
              <div
                key={image.id}
                className="side-image-container"
                onClick={() => handleImageSwap(newsId, index)}
              >
                <img
                  src={image.image}
                  alt={`Side-${image.id}`}
                  className="side-image"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleCommentSubmit = async (newsId: number) => {
    const token = localStorage.getItem('accessToken');
    const text = newComment[newsId]?.trim();

    if (!text || !token) {
      alert('Необходимо авторизоваться!');
      return;
    }

    try {
      const response = await axios.post(
        'https://tamik327.pythonanywhere.com/api/comments/',
        { news: newsId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(prev => ({
        ...prev,
        [newsId]: [...(prev[newsId] || []), response.data]
      }));

      setNewComment(prev => ({ ...prev, [newsId]: '' }));
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  return (
    <div className="life-ivits-container">
      <h2>Жизнь института</h2>

      <div className='novost-ivits'>
        <div className='checkbox-novosti'>
          <h4>Фильтр по категориям</h4>
          {categories.map(category => (
            <label key={category.id} className="checkbox-label">
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
          {localStorage.getItem('accessToken') && (
            <button 
              className="add-news-btn"
              onClick={() => setShowAddNews(true)}
            >
              Добавить новость
            </button>
          )}

          {showAddNews && (
            <Addnews
              categories={categories}
              onClose={() => setShowAddNews(false)}
              onSuccess={fetchData}
            />
          )}

          {loading ? (
            <div className="loader">Загрузка...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            filteredNews.map((item) => {
              const commentsToShow = showAllComments[item.id] 
                ? comments[item.id] 
                : comments[item.id]?.slice(0, 1);

              return (
                <div className='novost-item' key={item.id}>
                  <div className="novost-item-header">
                    {renderImageCollage(item.id, item.images)}
                    <div className="title-date">
                      <h3>{item.title}</h3>
                      <p className="publish-date">{formatDate(item.created_at)}</p>
                    </div>
                  </div>

                  <div className="tags">
                    <span className="tag">{getCategoryName(item.category)}</span>
                  </div>

                  <div className="novost-item-content">
                    <p>
                      {expandedNews[item.id] 
                        ? item.content 
                        : `${item.content.slice(0, 200)}${item.content.length > 200 ? '...' : ''}`}
                      {item.content.length > 200 && (
                        <button 
                          className="expand-btn"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {expandedNews[item.id] ? 'Свернуть' : 'Подробнее'}
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="interactions">
                    <div className="interaction-item">
                      <FaRegThumbsUp /> {item.likes_count}
                    </div>
                    <div className="interaction-item">
                      <FaRegComment /> {item.comments_count}
                    </div>
                  </div>

                  <div className="comments-section">
                    <div className={`comments-container ${showAllComments[item.id] ? 'expanded' : ''}`}>
                      {commentsToShow?.map(comment => (
                        <div className="comment" key={comment.id}>
                          <img
                            src={comment.author.avatar || '/default_avatar.jpg'}
                            alt="Аватар"
                            className="comment-avatar"
                          />
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="username">{comment.author.username}</span>
                              <span className="comment-date">{formatDate(comment.created_at)}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {comments[item.id]?.length > 1 && (
                      <button
                        className="toggle-comments-btn"
                        onClick={() => toggleShowAllComments(item.id)}
                      >
                        {showAllComments[item.id] ? 'Скрыть' : 'Показать все'}
                      </button>
                    )}

                    <div className="comment-form">
                      <textarea
                        value={newComment[item.id] || ''}
                        onChange={(e) => setNewComment(prev => ({
                          ...prev,
                          [item.id]: e.target.value
                        }))}
                        placeholder="Оставьте комментарий..."
                        rows={3}
                      />
                      <button
                        onClick={() => handleCommentSubmit(item.id)}
                        className="submit-comment-btn"
                      >
                        Отправить
                      </button>
                    </div>
                  </div>
                </div>
              );
            }))}
        </div>
      </div>
    </div>
  );
};