import { useState, useEffect } from "react";
import { AddTestimonial, TestimonialItem } from "../AddStatic/AddTestimonial/addtestimonial";
import './reviews.css';

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    author: string;
    course: string;
    text: string;
    image_url: string | null;
    created_at: string;
  }[];
}

export const Reviews = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [testimonialDragStart, setTestimonialDragStart] = useState(0);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Record<number, boolean>>({});
  const [testimonialsData, setTestimonialsData] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("https://tamik327.pythonanywhere.com/api/reviews/");
        
        if (!response.ok) {
          throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data: ApiResponse = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
          throw new Error('Некорректный формат данных от сервера');
        }

        const formattedData = data.results.map(item => ({
          id: item.id,
          author: item.author,
          role: item.course,
          text: item.text,
          photo: item.image_url || "/rabota.png",
          created_at: item.created_at
        }));

        setTestimonialsData(formattedData);
      } catch (err) {
        console.error('Ошибка при загрузке отзывов:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleTestimonialDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTestimonialDragStart(clientX);
  };

  const handleTestimonialDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (testimonialsData.length === 0) return;
    
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

  const toggleExpanded = (testimonialId: number) => {
    setExpandedTestimonials(prev => ({
      ...prev,
      [testimonialId]: !prev[testimonialId]
    }));
  };

  const handleAddTestimonial = async (testimonial: Omit<TestimonialItem, 'id'>) => {
    try {
      const formData = new FormData();
      formData.append('author', testimonial.author);
      formData.append('course', testimonial.role);
      formData.append('text', testimonial.text);
      
      if (testimonial.photo && testimonial.photo !== "/rabota.png") {
        const response = await fetch(testimonial.photo);
        const blob = await response.blob();
        const file = new File([blob], 'review-image.jpg', { type: blob.type });
        formData.append('image', file);
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch("https://tamik327.pythonanywhere.com/api/reviews/", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке отзыва');
      }

      const fetchResponse = await fetch("https://tamik327.pythonanywhere.com/api/reviews/");
      const newData: ApiResponse = await fetchResponse.json();
      
      const updatedTestimonials = newData.results.map(item => ({
        id: item.id,
        author: item.author,
        role: item.course,
        text: item.text,
        photo: item.image_url || "/rabota.png",
        created_at: item.created_at
      }));

      setTestimonialsData(updatedTestimonials);
      setCurrentTestimonial(0);
    } catch (err) {
      console.error('Ошибка при добавлении отзыва:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при добавлении отзыва');
    }
  };

  const shouldShowExpandButton = (text: string) => {
    const lineCount = text.split('\n').length;
    return lineCount > 4 || text.length > 200;
  };

  if (isLoading) {
    return <div className="loading">Загрузка отзывов...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <div className="testimonials-section"
      onMouseDown={handleTestimonialDragStart}
      onMouseUp={handleTestimonialDragEnd}
      onTouchStart={handleTestimonialDragStart}
      onTouchEnd={handleTestimonialDragEnd}>
      
      <div className="section-header">
        <h3 className="section-title">Отзывы студентов</h3>
        <AddTestimonial onSubmit={handleAddTestimonial} />
      </div>

      {testimonialsData.length === 0 ? (
        <p>Пока нет отзывов. Будьте первым!</p>
      ) : (
        <div className="testimonials-slider">
          <div className="slider-container" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
            {testimonialsData.map((testimonial) => {
              const isExpanded = expandedTestimonials[testimonial.id] || false;
              const showExpandButton = shouldShowExpandButton(testimonial.text);

              return (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="author-photo">
                    <img 
                      src={testimonial.photo} 
                      alt={testimonial.author}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/rabota.png";
                      }}
                    />
                  </div>
                  <div className="testimonial-content">
                    <div className={`text-container ${isExpanded ? 'expanded' : ''}`}>
                      <p className="testimonial-text">{testimonial.text}</p>
                    </div>
                    {showExpandButton && (
                      <button 
                        className="expand-button"
                        onClick={() => toggleExpanded(testimonial.id)}
                      >
                        {isExpanded ? 'Свернуть' : 'Развернуть'}
                      </button>
                    )}
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.author}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="dots-container">
            {testimonialsData.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};