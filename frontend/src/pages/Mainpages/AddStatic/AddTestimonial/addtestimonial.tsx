import { useState, useRef } from "react";
import './addtestimonial.css';

export interface TestimonialItem {
  id: number;
  author: string;
  text: string;
  role: string;
  photo: string;
  created_at?: string;
}

interface AddTestimonialProps {
  onSubmit: (testimonial: Omit<TestimonialItem, 'id'>) => Promise<void>;
}

export const AddTestimonial: React.FC<AddTestimonialProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [course, setCourse] = useState("");
  const [text, setText] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setAuthor("");
    setCourse("");
    setText("");
    setPhotoPreview("");
    formRef.current?.reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        author,
        role: course,
        text,
        photo: photoPreview || "/rabota.png"
      });

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        className="add-testimonial-button"
        onClick={() => setIsModalOpen(true)}
      >
        Добавить отзыв
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              className="modal-close"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
            >
              &times;
            </button>
            <h3>Добавить новый отзыв</h3>
            {error && <div className="error-message">{error}</div>}
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Автор:</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Курс:</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Текст отзыва:</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label>Фото (опционально):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isSubmitting}
                />
                {photoPreview && (
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="photo-preview"
                  />
                )}
              </div>
              <div className="form-actions">
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};