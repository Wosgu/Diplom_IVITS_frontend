import React, { useState, useEffect, useRef } from "react";
import "./banner.css";
import { gsap } from "gsap";
import axios from "axios";
import { ApiEndpointHelper } from "../../../Context/AuthContext";
import { useAuth } from "../../../Context/AuthContext";
import Cookies from 'js-cookie';

interface Banner {
  id: number;
  image_url: string | null;
  created_at: string;
  order: number;
}

export const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, userData } = useAuth();

  const isAdmin = isAuthenticated && userData?.role === 'admin';

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ results: Banner[] }>(ApiEndpointHelper.banners());
      setBanners(response.data.results.filter(b => b.image_url));
    } catch (err) {
      console.error("Ошибка при загрузке баннеров:", err);
      setError("Ошибка при загрузке баннеров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [banners, currentSlide]);

  const goToNext = () => {
    const nextIndex = (currentSlide + 1) % banners.length;
    goToSlide(nextIndex);
  };

  const goToSlide = (index: number) => {
    if (!sliderRef.current || banners.length < 2) {
      setCurrentSlide(index);
      return;
    }

    const slides = Array.from(sliderRef.current.children) as HTMLElement[];
    const direction = index > currentSlide ? 1 : -1;
    
    gsap.to(slides[currentSlide], {
      x: -direction * sliderRef.current.offsetWidth,
      duration: 0.8,
      ease: "power2.inOut"
    });
    
    gsap.fromTo(slides[index], 
      { x: direction * sliderRef.current.offsetWidth },
      { 
        x: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => setCurrentSlide(index)
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      setError("");

      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Допустимы только JPG/JPEG/PNG изображения");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Максимальный размер файла - 5MB");
      }

      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error("Требуется авторизация");
      }

      const formData = new FormData();
      formData.append("image", file, file.name);

      await axios.post(ApiEndpointHelper.banners(), formData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      await fetchBanners();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        setError(
          errorData?.detail || 
          errorData?.image?.[0] || 
          err.message ||
          "Ошибка при загрузке файла"
        );
      } else {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      }
      console.error("Ошибка загрузки:", err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="conveyor-banner">
      <div className="conveyor-container" ref={sliderRef}>
        {loading && !banners.length ? (
          <div className="banner-loading">Загрузка...</div>
        ) : banners.length > 0 ? (
          banners.map((banner, index) => (
            <div 
              key={`banner-${banner.id}`}
              className="conveyor-slide"
              style={{ 
                transform: `translateX(${(index - currentSlide) * 100}%)`,
                zIndex: index === currentSlide ? 2 : 1
              }}
            >
              <img
                src={banner.image_url!}
                alt={`Баннер ${index + 1}`}
                className="conveyor-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))
        ) : (
          <div className="no-banners">Нет доступных баннеров</div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="conveyor-dots">
          {banners.map((_, index) => (
            <button
              key={`dot-${index}`}
              className={`conveyor-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="conveyor-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            id="banner-upload-input"
            disabled={uploadLoading}
            style={{ display: "none" }}
          />
          <label 
            htmlFor="banner-upload-input" 
            className={`conveyor-upload-button ${uploadLoading ? "loading" : ""}`}
          >
            {uploadLoading ? "Загрузка..." : "+ Добавить баннер"}
          </label>
          {error && <div className="upload-error">{error}</div>}
        </div>
      )}
    </div>
  );
};