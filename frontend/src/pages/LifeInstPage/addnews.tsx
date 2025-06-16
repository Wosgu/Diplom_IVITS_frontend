import { useState, useEffect } from "react";
import axios from 'axios';
import './addnews.css';
import { ApiEndpointHelper, useAuth } from "../../Context/AuthContext";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface AddnewsProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
  fetchCategories?: () => Promise<void>;
  fetchTags?: () => Promise<void>;
}

export const Addnews: React.FC<AddnewsProps> = ({ 
  categories, 
  onClose, 
  onSuccess,
  fetchCategories,
  fetchTags
}) => {
  const { getAuthHeader } = useAuth();
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    categoryInput: '',
    selectedCategory: null as Category | { name: string } | null,
    tagInput: '',
    selectedTags: [] as Array<Tag | { name: string }>,
    images: [] as File[],
    is_published: true,
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{message: string; type: 'error' | 'warning'} | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<Category[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTagsData = async () => {
      try {
        const response = await axios.get<{ results: Tag[] }>(
          ApiEndpointHelper.tags(),
          { 
            ...getAuthHeader(),
            withCredentials: true 
          }
        );
        setAllTags(response.data.results);
      } catch (error) {
        console.error("Ошибка загрузки тегов:", error);
        setError({
          message: "Не удалось загрузить список тегов",
          type: 'error'
        });
      }
    };
    fetchTagsData();
  }, [getAuthHeader]);

  useEffect(() => {
    if (formState.categoryInput) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(formState.categoryInput.toLowerCase())
      );
      setCategorySuggestions(filtered);
    } else {
      setCategorySuggestions([]);
    }
  }, [formState.categoryInput, categories]);

  useEffect(() => {
    if (formState.tagInput) {
      const filtered = allTags.filter(t => 
        t.name.toLowerCase().includes(formState.tagInput.toLowerCase())
      );
      setTagSuggestions(filtered);
    } else {
      setTagSuggestions([]);
    }
  }, [formState.tagInput, allTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formState.title.length < 5 || formState.title.length > 200) {
        throw {
          message: 'Заголовок должен быть от 5 до 200 символов',
          type: 'error'
        };
      }

      if (formState.content.length < 50) {
        throw {
          message: 'Содержание должно быть не менее 50 символов',
          type: 'error'
        };
      }

      if (!formState.selectedCategory) {
        throw {
          message: 'Выберите категорию',
          type: 'error'
        };
      }

      if (formState.images.length > 5) {
        throw {
          message: 'Можно загрузить не более 5 изображений',
          type: 'warning'
        };
      }

      const formData = new FormData();
      formData.append('title', formState.title);
      formData.append('content', formState.content);
      formData.append('category', formState.selectedCategory.name);
      formData.append('is_published', String(formState.is_published));
      
      formState.selectedTags.forEach(tag => {
        formData.append('tags', tag.name);
      });

      formState.images.forEach(image => {
        formData.append('uploaded_images', image);
      });

      await axios.post(
        ApiEndpointHelper.news(),
        formData,
        {
          ...getAuthHeader(),
          withCredentials: true,
          headers: {
            ...(await getAuthHeader()).headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (fetchCategories) await fetchCategories();
      if (fetchTags) await fetchTags();

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Ошибка создания новости:", error);
      let errorMessage = {
        message: "Не удалось создать новость. Проверьте данные и попробуйте снова.",
        type: 'error' as const
      };

      if (error.response) {
        console.error("Детали ошибки:", error.response.data);
        errorMessage = {
          message: error.response.data.message || 
                  error.response.data.detail || 
                  (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)),
          type: 'error'
        };
      } else if (error.request) {
        errorMessage = {
          message: "Сервер не ответил. Проверьте соединение.",
          type: 'error'
        };
      } else if (error.message && error.type) {
        errorMessage = {
          message: error.message,
          type: error.type
        };
      } else if (error.message) {
        errorMessage = {
          message: error.message,
          type: 'error'
        };
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputValue = formState.categoryInput.trim();
      if (!inputValue) return;

      const existing = categories.find(c => 
        c.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (existing) {
        setFormState(prev => ({
          ...prev,
          selectedCategory: existing,
          categoryInput: ''
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          selectedCategory: { name: inputValue },
          categoryInput: ''
        }));
      }
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputValue = formState.tagInput.trim();
      if (!inputValue) return;

      const existing = allTags.find(t => 
        t.name.toLowerCase() === inputValue.toLowerCase()
      );

      if (existing && !formState.selectedTags.some(t => 'id' in t && t.id === existing.id)) {
        setFormState(prev => ({
          ...prev,
          selectedTags: [...prev.selectedTags, existing],
          tagInput: ''
        }));
      } else if (!formState.selectedTags.some(t => t.name.toLowerCase() === inputValue.toLowerCase())) {
        setFormState(prev => ({
          ...prev,
          selectedTags: [...prev.selectedTags, { name: inputValue }],
          tagInput: ''
        }));
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formState.images.length + newFiles.length > 5) {
        setError({
          message: 'Можно загрузить не более 5 изображений',
          type: 'warning'
        });
        return;
      }
      setFormState(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles].slice(0, 5)
      }));
    }
  };

  const removeTag = (index: number) => {
    setFormState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    setFormState(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const selectCategory = (category: Category) => {
    setFormState(prev => ({
      ...prev,
      selectedCategory: category,
      categoryInput: ''
    }));
  };

  const selectTag = (tag: Tag) => {
    if (!formState.selectedTags.some(t => 'id' in t && t.id === tag.id)) {
      setFormState(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, tag],
        tagInput: ''
      }));
    }
  };

  return (
    <div className="create-news-overlay">
      <div className="create-news-form-container">
        <div className="create-news-form">
          <button className="close-btn" onClick={onClose}>&times;</button>
          <h3>Создание новости</h3>

          {error && (
            <div className={`error-message ${error.type === 'warning' ? 'warning' : ''}`}>
              {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Заголовок</label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                required
                minLength={5}
                maxLength={200}
                placeholder="Введите заголовок (5-200 символов)"
              />
            </div>

            <div className="form-group">
              <label>Содержание</label>
              <textarea
                value={formState.content}
                onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                required
                minLength={50}
                rows={5}
                placeholder="Напишите содержание новости (минимум 50 символов)"
              />
            </div>

            <div className="form-group">
              <label>Категория</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formState.categoryInput}
                  onChange={(e) => setFormState({ ...formState, categoryInput: e.target.value })}
                  onKeyDown={handleCategoryKeyDown}
                  placeholder="Введите категорию и нажмите Enter или выберите из списка"
                />
                {categorySuggestions.length > 0 && (
                  <div className="suggestions">
                    {categorySuggestions.map(category => (
                      <div
                        key={category.id}
                        className="suggestion-item"
                        onClick={() => selectCategory(category)}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formState.selectedCategory && (
                <div className="chip">
                  {formState.selectedCategory.name}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => setFormState(prev => ({
                      ...prev,
                      selectedCategory: null
                    }))}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Теги</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formState.tagInput}
                  onChange={(e) => setFormState({ ...formState, tagInput: e.target.value })}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Введите тег и нажмите Enter или выберите из списка"
                />
                {tagSuggestions.length > 0 && (
                  <div className="suggestions">
                    {tagSuggestions.map(tag => (
                      <div
                        key={tag.id}
                        className="suggestion-item"
                        onClick={() => selectTag(tag)}
                      >
                        {tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="chips-container">
                {formState.selectedTags.map((tag, index) => (
                  <div key={tag.name} className="chip">
                    {tag.name}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeTag(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Изображения (максимум 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={formState.images.length >= 5}
              />
              <div className="image-previews">
                {formState.images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Preview ${index}`}
                      className="preview-image"
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formState.is_published}
                  onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                />
                <span className="checkbox-custom"></span>
                Опубликовать сразу
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Создание...' : 'Создать новость'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};