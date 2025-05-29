import { useState } from "react";
import './addtestimonial.css';

export interface TestimonialItem {
  id: number;
  author: string;
  text: string;
  role: string;
  photo: string;
}

interface AddTestimonialProps {
  onSubmit: (testimonial: Omit<TestimonialItem, 'id'>) => void;
}

export const AddTestimonial: React.FC<AddTestimonialProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [author, setAuthor] = useState("");
  const [course, setCourse] = useState("");
  const [text, setText] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('author', author);
      formData.append('course', course);
      formData.append('text', text);
      if (photoFile) {
        formData.append('image', photoFile);
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch("https://tamik327.pythonanywhere.com/api/reviews/", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при отправке отзыва');
      }

      const data = await response.json();
      
      // Вызываем onSubmit с данными нового отзыва
      onSubmit({
        author: data.author,
        role: data.course,
        text: data.text,
        photo: data.image_url || "/rabota.png"
      });

      // Закрываем модальное окно и сбрасываем форму
      setIsModalOpen(false);
      setAuthor("");
      setCourse("");
      setText("");
      setPhotoPreview("");
      setPhotoFile(null);
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
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              &times;
            </button>
            <h3>Добавить новый отзыв</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
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
                  onClick={() => setIsModalOpen(false)}
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