import { useRef,useState } from "react";

interface SliderItem {
    id: number;
    imageUrl: string;
    description: string;
}

export const Achievement = () => {
    
    const [currentSlideIndex] = useState(0);   
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [prevDragOffset, setPrevDragOffset] = useState(0);

    const sliderItems: SliderItem[] = [
        {
          id: 1,
          imageUrl: "/mfti.png",
          description: "День открытых дверей 2023"
        },
        {
          id: 2,
          imageUrl: "/mfti.png",
          description: "Хакатон по веб-разработке"
        },
        {
          id: 3,
          imageUrl: "/mfti.png",
          description: "Конференция по искусственному интеллекту"
        },
        {
          id: 4,
          imageUrl: "/mfti.png",
          description: "День открытых дверей 2023"
        },
        {
          id: 5,
          imageUrl: "/mfti.png",
          description: "Хакатон по веб-разработке"
        },
        {
          id: 6,
          imageUrl: "/mfti.png",
          description: "Конференция по искусственному интеллекту"
        }
      ];

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
        const sliderWidth = containerWidth * (sliderItems.length / 3);
        const maxOffset = containerWidth - sliderWidth + (containerWidth * 0);
      
        setDragOffset(Math.min(Math.max(newOffset, maxOffset), 0));
      };
      
      const handleDragEnd = () => {
        setIsDragging(false);
        setPrevDragOffset(dragOffset);
      };

    return(

        
        <>
        <div className="slider-section">
          <h3 className="slider-title">Наши достижения</h3>
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
              {sliderItems.map((item) => (
                <div key={item.id} className="slide">
                  <div className="slide-image"><img src={item.imageUrl} alt={item.description}/></div>
                  <div className="slide-caption">
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
    )
}