import { useState } from "react";

interface TestimonialItem {
    id: number;
    author: string;
    text: string;
    role: string;
    photo: string;
  }

export const Reviews = () => {

    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [testimonialDragStart, setTestimonialDragStart] = useState(0);
    const handleTestimonialDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setTestimonialDragStart(clientX);
    };
  
    const handleTestimonialDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
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
    const testimonialsData: TestimonialItem[] = [
        {
          id: 1,
          author: "Иван Петров",
          role: "Выпускник 2020",
          text: "Отличная программа обучения, современные технологии и профессиональные преподаватели.",
          photo: "/rabota.png"
        },
        {
          id: 2,
          author: "Мария Сидорова",
          role: "Студентка 3 курса",
          text: "Прекрасные возможности для практики и участия в реальных проектах.",
          photo: "/rabota.png"
        },
        {
          id: 3,
          author: "Алексей Иванов",
          role: "Родитель студента",
          text: "Вижу прогресс в знаниях ребенка, благодарен преподавательскому составу.",
          photo: "/rabota.png"
        }
      ];
    return(
        <>
        <div className="testimonials-section"
          onMouseDown={handleTestimonialDragStart}
          onMouseUp={handleTestimonialDragEnd}
          onTouchStart={handleTestimonialDragStart}
          onTouchEnd={handleTestimonialDragEnd}>
          <h3 className="section-title">Отзывы студентов</h3>
          <div className="testimonials-slider">
            <div 
              className="slider-container"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonialsData.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="testimonial-card"
                >
                  <div className="author-photo">
                    <img src={testimonial.photo} alt={testimonial.author} />
                  </div>
                  <div className="testimonial-content">
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.author}</h4>
                      <p className="author-role">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
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
        </div>
        </>
    )
}