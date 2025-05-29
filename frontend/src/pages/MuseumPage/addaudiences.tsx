import { useState } from 'react';
import axios from 'axios';
import './addaudiences.css';

export const Addaudiences = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    images: [] as Array<{ file: File; description: string }>,
    characteristics: [] as Array<{ name: string; value: string }>
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) newErrors.push('Название аудитории обязательно');
    if (formData.name.length > 200) newErrors.push('Название не должно превышать 200 символов');
    
    formData.characteristics.forEach((char, index) => {
      if (!char.name || !char.value) {
        newErrors.push(`Характеристика #${index + 1}: заполните оба поля`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      // Шаг 1: Создание аудитории
      const audienceResponse = await axios.post(
        'https://tamik327.pythonanywhere.com/api/audiences/',
        {
          name: formData.name,
          description: formData.description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const audienceId = audienceResponse.data.id;

      // Шаг 2: Загрузка изображений
      const imagePromises = formData.images.map(async (img) => {
        const imageFormData = new FormData();
        imageFormData.append('audience', audienceId.toString());
        imageFormData.append('image', img.file);
        imageFormData.append('description', img.description);

        return axios.post(
          'https://tamik327.pythonanywhere.com/api/audience-images/',
          imageFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          }
        );
      });

      // Шаг 3: Добавление характеристик
      const characteristicPromises = formData.characteristics.map(char => 
        axios.post(
          'https://tamik327.pythonanywhere.com/api/characteristics/',
          {
            audience: audienceId,
            name: char.name,
            value: char.value
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        )
      );

      // Ожидаем завершения всех запросов
      await Promise.all([...imagePromises, ...characteristicPromises]);
      
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Ошибка при создании аудитории:', error);
      setErrors(['Ошибка при создании аудитории. Проверьте данные и повторите попытку.']);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        file,
        description: ''
      }));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5)
      }));
    }
  };

  const updateImageDescription = (index: number, description: string) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index].description = description;
      return { ...prev, images: newImages };
    });
  };

  return (
    <>
      {localStorage.getItem('accessToken') && (
        <button 
          className="gradient-action-btn"
          onClick={() => setShowForm(true)}
        >
          Добавить аудиторию
        </button>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="form-container">
            <button 
              className="close-btn" 
              onClick={() => setShowForm(false)}
            >
              &times;
            </button>
            <h2>Создание новой аудитории</h2>
            
            {errors.length > 0 && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <div className="error-list">
                  {errors.map((error, index) => (
                    <div key={index} className="error-item">• {error}</div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Поля названия и описания аудитории */}
              <div className="form-group">
                <label>Название аудитории *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Введите название аудитории"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Добавьте описание аудитории"
                  rows={4}
                />
              </div>

              {/* Блок загрузки изображений */}
              <div className="form-group">
                <label>Изображения (максимум 5)</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={formData.images.length >= 5}
                  />
                  <div className="image-previews">
                    {formData.images.map((img, index) => (
                      <div key={index} className="image-preview">
                        <img 
                          src={URL.createObjectURL(img.file)} 
                          alt={`Preview ${index}`}
                        />
                        <input
                          type="text"
                          placeholder="Описание изображения"
                          value={img.description}
                          onChange={(e) => updateImageDescription(index, e.target.value)}
                          className="image-description-input"
                        />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                    }))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Блок характеристик */}
              <div className="form-group">
                <label>Характеристики</label>
                <div className="characteristics-container">
                  {formData.characteristics.map((char, index) => (
                    <div key={index} className="characteristic-input">
                      <input
                        type="text"
                        placeholder="Название"
                        value={char.name}
                        onChange={(e) => {
                          const newChars = [...formData.characteristics];
                          newChars[index].name = e.target.value;
                          setFormData({...formData, characteristics: newChars});
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Значение"
                        value={char.value}
                        onChange={(e) => {
                          const newChars = [...formData.characteristics];
                          newChars[index].value = e.target.value;
                          setFormData({...formData, characteristics: newChars});
                        }}
                      />
                      <button
                        type="button"
                        className="remove-characteristic"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          characteristics: prev.characteristics.filter((_, i) => i !== index)
                        }))}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-characteristic"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      characteristics: [...prev.characteristics, { name: '', value: '' }]
                    }))}
                  >
                    + Добавить характеристику
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Сохранение...' : 'Создать аудиторию'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};