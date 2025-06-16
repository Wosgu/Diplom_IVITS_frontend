import { useRef, useState, useEffect } from "react";
import { AddAchievementButton } from "../AddStatic/AddAchievement/addachievement";
import axios from "axios";
import "./Achievement.css";
import { ApiEndpointHelper } from "../../../Context/AuthContext";
import Cookies from "js-cookie";

interface AchievementItem {
  id: number;
  title: string;
  image_url: string | null;
}

interface ApiResponse {
  results: AchievementItem[];
}

interface CurrentUser {
  id: number;
  role: string;
  username: string;
}

export const Achievement = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [currentSlideIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [prevDragOffset, setPrevDragOffset] = useState(0);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("access_token");
      if (!token) return;

      try {
        const response = await axios.get<CurrentUser>(
          ApiEndpointHelper.userMe(),
          {
            withCredentials:true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsAdmin(response.data.role === "admin");
      } catch (err) {
        console.error("Ошибка при получении данных пользователя:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          ApiEndpointHelper.achievement(),
        {withCredentials:true});
        setAchievements(response.data.results);
      } catch (error) {
        setError("Ошибка загрузки достижений");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleAddAchievement = async (newItem: { title: string; image: File }) => {
    if (!isAdmin) return;

    try {
      const token = Cookies.get("access_token");
      if (!token) throw new Error("Требуется авторизация");

      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("image", newItem.image);

      const response = await axios.post<AchievementItem>(
        ApiEndpointHelper.achievement(),
        formData,
        {
          withCredentials:true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAchievements((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error("Ошибка добавления:", error);
      setError("Ошибка при добавлении достижения");
    }
  };

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
    setDragStartX(clientX);
    setPrevDragOffset(dragOffset);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const distance = clientX - dragStartX;
    const newOffset = prevDragOffset + distance;
    const containerWidth = sliderRef.current?.offsetWidth || 0;
    const sliderWidth = containerWidth * (achievements.length / 3);
    const maxOffset = containerWidth - sliderWidth;
    setDragOffset(Math.min(Math.max(newOffset, maxOffset), 0));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setPrevDragOffset(dragOffset);
  };

  if (loading)
    return (
      <div className="slider-section">
        <div className="slider-header">
          <h3 className="slider-title">Наши достижения</h3>
        </div>
        <div className="loading-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="loading-card">
              <div className="loading-image shimmer"></div>
              <div className="loading-text shimmer"></div>
              <div className="loading-text shimmer short"></div>
            </div>
          ))}
        </div>
      </div>
    );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="slider-section">
      <div className="slider-header">
        <h3 className="slider-title">Наши достижения</h3>
        {isAdmin && (
          <AddAchievementButton
            isAuthenticated={true}
            onAdd={handleAddAchievement}
          />
        )}
      </div>

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
            transition: isDragging
              ? "none"
              : "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`slide ${hoveredCard === item.id ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="slide-content">
                <div className="slide-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="card-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="slide-caption">
                  <h4 className="achievement-title">{item.title}</h4>
                  <div className="shine"></div>
                  <div className="hover-effect"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};