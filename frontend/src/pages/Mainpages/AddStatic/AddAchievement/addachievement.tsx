import { useState, useRef, ChangeEvent } from "react";
import './addachievement.css';

interface AddAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: { title: string; image: File }) => void;
}

const AddAchievementModal = ({ isOpen, onClose, onAdd }: AddAchievementModalProps) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image) return;
    
    onAdd({ title, image });
    setTitle("");
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Добавить достижение</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Изображение:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              required
            />
            {preview && <img src={preview} alt="Preview" className="preview-image" />}
          </div>
          <div className="form-actions">
            <button type="submit">Добавить</button>
            <button type="button" onClick={onClose}>Отмена</button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AddAchievementButtonProps {
  isAuthenticated: boolean;
  onAdd: (item: { title: string; image: File }) => void;
}

export const AddAchievementButton = ({ isAuthenticated, onAdd }: AddAchievementButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button 
        className="add-button"
        onClick={() => setIsModalOpen(true)}
      >
        + Добавить достижение
      </button>
      <AddAchievementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
};