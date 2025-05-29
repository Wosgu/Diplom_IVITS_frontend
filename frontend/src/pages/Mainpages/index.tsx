import { useState, useEffect } from "react";
import "./index.css";
import { News } from "./news";
import { Program } from "./program";
import { Achievement } from "./achievement";
import { Reviews } from "./Reviews/reviews";
import { AddBanner } from "./AddStatic/AddBanner/addbanner";

interface Banner {
  id: number;
  image_url: string | null;
  created_at: string;
  order: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Banner[];
}

export const MainPage = () => {
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [bannerDragStart, setBannerDragStart] = useState(0);
  const [bannerImages, setBannerImages] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE = "https://tamik327.pythonanywhere.com/api/banners/";

  // Проверка прав администратора
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Здесь должна быть логика проверки роли пользователя
      // Для примера просто проверяем наличие токена
      setIsAdmin(true);
    }
  }, []);

  const fetchBanners = async (url: string = API_BASE) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      setBannerImages(prev => {
        // Для первой страницы заменяем весь список
        if (url === API_BASE) {
          return data.results.filter(b => b.image_url);
        }
        // Для последующих страниц добавляем к существующему списку
        return [...prev, ...data.results.filter(b => b.image_url)];
      });

      // Если на странице 10 элементов, проверяем следующую страницу
      if (data.results.length === 10 && data.next) {
        await fetchBanners(data.next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сервера");
      console.error("Ошибка загрузки баннеров:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleBannerDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setBannerDragStart(clientX);
  };

  const handleBannerDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (bannerImages.length === 0) return;
    
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
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

  if (loading && bannerImages.length === 0) {
    return <div className="loading">Загрузка баннеров...</div>;
  }

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <div className="fade-slider"
          onMouseDown={handleBannerDragStart}
          onMouseUp={handleBannerDragEnd}
          onTouchStart={handleBannerDragStart}
          onTouchEnd={handleBannerDragEnd}>
          <div className="fade-slider__container">
            {bannerImages.length > 0 ? (
              bannerImages.map((banner, index) => (
                <div 
                  key={`banner-${banner.id}`}
                  className={`fade-slider__item ${index === currentBannerSlide ? "is-active" : ""}`}
                >
                  <img 
                    src={banner.image_url!} 
                    alt={`Баннер ${index + 1}`} 
                    className="fade-slider__image" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="fade-slider__item is-active">
                <div className="no-banners">Нет доступных баннеров</div>
              </div>
            )}
          </div>
          {bannerImages.length > 0 && (
            <div className="fade-slider__dots">
              {bannerImages.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`fade-slider__dot ${index === currentBannerSlide ? "is-selected" : ""}`}
                  onClick={() => setCurrentBannerSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      
      {isAdmin && <AddBanner onAddSuccess={() => fetchBanners()} />}
      
      <div className="main-index">
        <div className="index-info">
          <div className="rolikvits">
            <iframe 
              src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" 
              allow="autoplay; encrypted-media" 
              title="Видео о школе"
            />
          </div>
        </div>
        <News/>
        <Program/>
        <Achievement/>
        <Reviews/>
      </div>
    </>
  );
};