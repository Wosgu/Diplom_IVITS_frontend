import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ApiEndpointHelper } from "../../Context/AuthContext";

interface Tag {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    description: string;
}

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
    category: Category;
    tags: Tag[];
    comments_count: number;
    likes_count: number;
}

export const News = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        
        axios.get<NewsItem[]>(ApiEndpointHelper.latest_news(), {
            signal: controller.signal,
            withCredentials:true
        })
        .then(response => {
            setNews(response.data);
            setLoading(false);
        })
        .catch(error => {
            if (!axios.isCancel(error)) {
                console.error("Ошибка при получении новостей:", error);
                setError("Не удалось загрузить новости. Пожалуйста, попробуйте позже.");
                setLoading(false);
            }
        });

        return () => controller.abort();
    }, []);

    const getFirstImageUrl = (images: Array<{ id: number; image: string }>): string => {
        return images.length > 0 
            ? images[0].image 
            : "/path/to/placeholder/image.png";
    };

    return (
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
                        <div 
                            className="news-card" 
                            key={item.id} 
                            onClick={() => navigate("/lifeinst")}
                        >
                            <div className="news-image-wrapper">
                                <img
                                    src={getFirstImageUrl(item.images)}
                                    alt={item.title}
                                    className="news-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/path/to/placeholder/image.png";
                                    }}
                                />
                                <div className="news-title-overlay">
                                    <h3 className="news-title">{item.title}</h3>
                                </div>
                            </div>
                            <div className="news-content">
                                <div className="tags-container">
                                    {item.tags.map((tag) => (
                                        <span key={tag.id} className="news-tag">
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="news-excerpt">
                                    {item.content.slice(0, 120)}
                                    {item.content.length > 120 && "..."}
                                </p>
                                <div className="news-date">
                                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};