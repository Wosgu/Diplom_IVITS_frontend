import { useRef, useState, useEffect } from "react";
import { AddAchievementButton } from "./AddStatic/AddAchievement/addachievement";
import axios from "axios";

interface AchievementItem {
  id: number;
  title: string;
  image_url: string | null;
}

interface ApiResponse {
  results: AchievementItem[];
}

export const Achievement = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Slider states
  const [currentSlideIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [prevDragOffset, setPrevDragOffset] = useState(0);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await axios.get<ApiResponse>("https://tamik327.pythonanywhere.com/api/achievements/");
        setAchievements(response.data.results);

        const token = localStorage.getItem("accessToken");
        if (token) setIsAdmin(true);

      } catch (error) {
        setError("Ошибка загрузки достижений");
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleAddAchievement = async (newItem: { title: string; image: File }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const formData = new FormData();
      formData.append("title", newItem.title);
      formData.append("image", newItem.image);

      const response = await axios.post<AchievementItem>(
        "https://tamik327.pythonanywhere.com/api/achievements/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      setAchievements(prev => [response.data, ...prev]);
    } catch (error) {
      console.error("Ошибка добавления:", error);
    }
  };

  // Slider handlers remain unchanged
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
    const sliderWidth = containerWidth * (achievements.length / 3);
    const maxOffset = containerWidth - sliderWidth;
    setDragOffset(Math.min(Math.max(newOffset, maxOffset), 0));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setPrevDragOffset(dragOffset);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

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
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {achievements.map((item) => (
            <div key={item.id} className="slide">
              <div className="slide-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <div className="no-image">Нет фото</div>
                )}
              </div>
              <div className="slide-caption">
                <p>{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};