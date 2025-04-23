import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export const News = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
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
    
    const getFirstImageUrl = (images: Array<{ id: number; image: string }>): string => {
        return images.length > 0 ? images[0].image : "/path/to/placeholder/image.png";
    };

    return(
        <>
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
        </>
    )
}