import { useState, useEffect} from "react";
import axios from "axios";
import "./index.css";
import { News } from "./news";
import { Program } from "./program";
import {Achievement} from "./achievement";
import { Reviews } from "./reviews";

export const MainPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<{ username: string } | null>(null);
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
    }});
    

  return (
    <>
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
        </div>
        <News/>
        <Program/>
        <Achievement/>
        <Reviews/>
      </div>
    </>
  );
};