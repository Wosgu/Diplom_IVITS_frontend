import { useState, useEffect } from "react";
import axios from 'axios';
import './addnews.css';

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

interface AddnewsProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export const Addnews: React.FC<AddnewsProps> = ({ categories, onClose, onSuccess }) => {
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    categoryInput: '',
    selectedCategories: [] as Category[],
    tagInput: '',
    selectedTags: [] as Tag[],
    images: [] as File[],
    is_published: true,
  });

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorySuggestions, setCategorySuggestions] = useState<Category[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get<{ results: Tag[] }>("https://tamik327.pythonanywhere.com/api/tags/");
        setAllTags(response.data.results);
      } catch (error) {
        console.error("Ошибка загрузки тегов:", error);
        setError("Не удалось загрузить список тегов");
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    if (formState.categoryInput) {
      const filtered = categories.filter(c => 
        c.name.toLowerCase().includes(formState.categoryInput.toLowerCase())
      );
      setCategorySuggestions(filtered);
    } else {
      setCategorySuggestions([]);
    }
  }, [formState.categoryInput]);

  useEffect(() => {
    if (formState.tagInput) {
      const filtered = allTags.filter(t => 
        t.name.toLowerCase().includes(formState.tagInput.toLowerCase())
      );
      setTagSuggestions(filtered);
    } else {
      setTagSuggestions([]);
    }
  }, [formState.tagInput]);

  const createNewCategory = async (name: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post<Category>(
        "https://tamik327.pythonanywhere.com/api/categories/",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      setError("Не удалось создать категорию");
      return null;
    }
  };

  const createNewTag = async (name: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post<Tag>(
        "https://tamik327.pythonanywhere.com/api/tags/",
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      setError("Не удалось создать тег");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (formState.title.length < 5 || formState.title.length > 200) {
        throw new Error('Заголовок должен быть от 5 до 200 символов');
      }

      if (formState.content.length < 50) {
        throw new Error('Содержание должно быть не менее 50 символов');
      }

      if (formState.selectedCategories.length === 0) {
        throw new Error('Необходимо выбрать или создать хотя бы одну категорию');
      }

      const formData = new FormData();
      formData.append('title', formState.title);
      formData.append('content', formState.content);
      formState.selectedCategories.forEach(cat => 
        formData.append('categories', cat.id.toString())
      );
      formState.selectedTags.forEach(tag => 
        formData.append('tags', tag.id.toString())
      );
      formState.images.forEach(file => 
        formData.append('uploaded_images', file)
      );
      formData.append('is_published', formState.is_published.toString());

      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        "https://tamik327.pythonanywhere.com/api/news/",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Ошибка создания новости:", error);
      setError(error instanceof Error ? error.message : "Не удалось создать новость");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryInput = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputValue = formState.categoryInput.trim();
      if (!inputValue) return;

      const existing = categories.find(c => c.name.toLowerCase() === inputValue.toLowerCase());
      if (existing) {
        setFormState(prev => ({
          ...prev,
          selectedCategories: [...prev.selectedCategories, existing],
          categoryInput: ''
        }));
      } else {
        const newCategory = await createNewCategory(inputValue);
        if (newCategory) {
          setFormState(prev => ({
            ...prev,
            selectedCategories: [...prev.selectedCategories, newCategory],
            categoryInput: ''
          }));
        }
      }
    }
  };

  const handleTagInput = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const inputValue = formState.tagInput.trim();
      if (!inputValue) return;

      const existing = allTags.find(t => t.name.toLowerCase() === inputValue.toLowerCase());
      if (existing) {
        setFormState(prev => ({
          ...prev,
          selectedTags: [...prev.selectedTags, existing],
          tagInput: ''
        }));
      } else {
        const newTag = await createNewTag(inputValue);
        if (newTag) {
          setFormState(prev => ({
            ...prev,
            selectedTags: [...prev.selectedTags, newTag],
            tagInput: ''
          }));
          setAllTags(prev => [...prev, newTag]);
        }
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormState(prev => ({
        ...prev,
        images: [...prev.images, ...newFiles].slice(0, 5)
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormState(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="create-news-overlay">
      <div className="create-news-form">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h3>Создание новости</h3>
        
        {error && <div className="error-message">{error}</div>}

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
            <label>Категории</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formState.categoryInput}
                onChange={(e) => setFormState({ ...formState, categoryInput: e.target.value })}
                onKeyDown={handleCategoryInput}
                placeholder="Введите категории и нажмите Enter"
              />
              {categorySuggestions.length > 0 && (
                <div className="suggestions">
                  {categorySuggestions.map(category => (
                    <div
                      key={category.id}
                      className="suggestion-item"
                      onClick={() => setFormState(prev => ({
                        ...prev,
                        selectedCategories: [...prev.selectedCategories, category],
                        categoryInput: ''
                      }))}
                    >
                      {category.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="chips-container right-aligned">
              {formState.selectedCategories.map(category => (
                <div key={category.id} className="chip">
                  {category.name}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => setFormState(prev => ({
                      ...prev,
                      selectedCategories: prev.selectedCategories.filter(c => c.id !== category.id)
                    }))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formState.tagInput}
                onChange={(e) => setFormState({ ...formState, tagInput: e.target.value })}
                onKeyDown={handleTagInput}
                placeholder="Введите теги и нажмите Enter"
              />
              {tagSuggestions.length > 0 && (
                <div className="suggestions">
                  {tagSuggestions.map(tag => (
                    <div
                      key={tag.id}
                      className="suggestion-item"
                      onClick={() => setFormState(prev => ({
                        ...prev,
                        selectedTags: [...prev.selectedTags, tag],
                        tagInput: ''
                      }))}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="chips-container right-aligned">
              {formState.selectedTags.map(tag => (
                <div key={tag.id} className="chip">
                  {tag.name}
                  <button
                    type="button"
                    className="chip-remove"
                    onClick={() => setFormState(prev => ({
                      ...prev,
                      selectedTags: prev.selectedTags.filter(t => t.id !== tag.id)
                    }))}
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
  );
};