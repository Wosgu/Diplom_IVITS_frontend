import { useState, useEffect } from 'react';
import axios from 'axios';
import { ApiEndpointHelper, useAuth } from '../../../Context/AuthContext';
import './facultyCards.css';

interface Faculty {
  id: number;
  name: string;
  position: string;
  degree?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  department: {
    id: number;
    name: string;
  };
}

interface Department {
  id: number;
  name: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Faculty[];
}

export const FacultyCards = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [currentDepartment, setCurrentDepartment] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const { userData, getAuthHeader } = useAuth();

  const [formData, setFormData] = useState({
    department_id: 1,
    name: '',
    position: '',
    degree: '',
    email: '',
    phone: '',
    photo: null as File | null
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const filteredFaculty = faculty.filter(f => 
    currentDepartment ? f.department.id === currentDepartment : true
  );

  const loadAllFaculty = async () => {
    let allFaculty: Faculty[] = [];
    let nextPage: string | null = 'https://vits44.ru/api/faculty/';
    
    while (nextPage) {
      
      allFaculty = [...allFaculty, ...(await axios.get<ApiResponse>(
          nextPage,
          { withCredentials: true }
        )).data.results];
      nextPage = (await axios.get<ApiResponse>(
        nextPage,
        { withCredentials: true }
      )).data.next;
    }
    
    return allFaculty;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Загружаем список кафедр
        const departmentsResponse = await axios.get<Department[]>(
          'https://vits44.ru/api/faculty/departments/',
          { withCredentials: true }
        );
        
        setDepartments(departmentsResponse.data);
        
        // Загружаем всех преподавателей с пагинацией
        const allFaculty = await loadAllFaculty();
        setFaculty(allFaculty);
        
        if (departmentsResponse.data.length > 0) {
          const firstDeptId = departmentsResponse.data[0].id;
          setCurrentDepartment(firstDeptId);
          setFormData(prev => ({...prev, department_id: firstDeptId}));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const nextFaculty = () => {
    if (filteredFaculty.length === 0) return;
    setCurrentIndex(prev => (prev === filteredFaculty.length - 1 ? 0 : prev + 1));
  };

  const prevFaculty = () => {
    if (filteredFaculty.length === 0) return;
    setCurrentIndex(prev => (prev === 0 ? filteredFaculty.length - 1 : prev - 1));
  };

  const changeDepartment = (departmentId: number) => {
    setCurrentDepartment(departmentId);
    setCurrentIndex(0);
    setFormData(prev => ({...prev, department_id: departmentId}));
  };

  const openDeleteModal = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFacultyToDelete(null);
  };

  const deleteFaculty = async () => {
    if (!facultyToDelete) return;
    
    try {
      const authHeaders = await getAuthHeader();
      
      await axios.delete(
        `https://vits44.ru/api/faculty/${facultyToDelete.id}/`,
        {
          ...authHeaders,
          withCredentials: true
        }
      );
      
      // Обновляем список преподавателей с пагинацией
      const updatedFaculty = await loadAllFaculty();
      setFaculty(updatedFaculty);
      
      // Корректируем индекс если нужно
      if (currentIndex >= filteredFaculty.length - 1) {
        setCurrentIndex(Math.max(0, filteredFaculty.length - 2));
      }
      
      closeDeleteModal();
    } catch (err) {
      console.error('Ошибка удаления преподавателя:', err);
      setError('Не удалось удалить преподавателя. Проверьте права доступа.');
    }
  };

  const openForm = () => {
    setShowForm(true);
    setFormSuccess(false);
    setFormErrors({});
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      department_id: currentDepartment || departments[0]?.id || 1,
      name: '',
      position: '',
      degree: '',
      email: '',
      phone: '',
      photo: null
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
    if (formErrors[name]) {
      setFormErrors(prev => ({...prev, [name]: ''}));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({...prev, photo: e.target.files![0]}));
      if (formErrors.photo) {
        setFormErrors(prev => ({...prev, photo: ''}));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Введите ФИО преподавателя';
    if (!formData.position.trim()) errors.position = 'Введите должность';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setFormSubmitting(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('department_id', formData.department_id.toString());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('position', formData.position);
      if (formData.degree) formDataToSend.append('degree', formData.degree);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.photo) formDataToSend.append('photo', formData.photo);
      
      const authHeaders = await getAuthHeader();
      
      await axios.post(
        'https://vits44.ru/api/faculty/',
        formDataToSend,
        {
          headers: {
            ...authHeaders?.headers,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      
      // Обновляем список после добавления
      const updatedFaculty = await loadAllFaculty();
      setFaculty(updatedFaculty);
      setFormSuccess(true);
      setFormSubmitting(false);
      
      setTimeout(() => {
        closeForm();
        setFormSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Ошибка создания преподавателя:', err);
      setFormErrors({
        submit: 'Не удалось создать преподавателя. Пожалуйста, попробуйте еще раз.'
      });
      setFormSubmitting(false);
    }
  };

  if (loading) return <div className="faculty-slider loading">Загрузка данных...</div>;
  if (error) return <div className="faculty-slider error">{error}</div>;
  if (departments.length === 0) return <div className="faculty-slider">Нет данных о кафедрах</div>;

  const currentFaculty = filteredFaculty[currentIndex];
  const isAdmin = ApiEndpointHelper.isAdmin(userData);

  return (
    <section className="faculty-slider">
      <h2 className="slider-title">Профессорско-преподавательский состав</h2>

      {isAdmin && (
        <div className="faculty-actions">
          <button className="add-faculty-btn" onClick={openForm}>
            Добавить преподавателя
          </button>
        </div>
      )}

      {showForm && (
        <div className="faculty-form-overlay">
          <div className="faculty-form-container">
            <div className="form-header">
              <h3>Добавить нового преподавателя</h3>
              <button className="close-form-btn" onClick={closeForm} title="Закрыть">
                &times;
              </button>
            </div>
            
            {formSuccess ? (
              <div className="form-success">Преподаватель успешно добавлен!</div>
            ) : (
              <form onSubmit={handleSubmit} className="faculty-form">
                <div className="form-group">
                  <label>Кафедра:</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>ФИО преподавателя:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={formErrors.name ? 'error' : ''}
                    placeholder="Иванов Иван Иванович"
                  />
                  {formErrors.name && (
                    <span className="error-message">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Должность:</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className={formErrors.position ? 'error' : ''}
                    placeholder="Доцент"
                  />
                  {formErrors.position && (
                    <span className="error-message">{formErrors.position}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ученая степень:</label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    placeholder="Кандидат наук"
                  />
                </div>

                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ivanov@university.ru"
                  />
                </div>

                <div className="form-group">
                  <label>Телефон:</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+79991234567"
                  />
                </div>

                <div className="form-group">
                  <label>Фотография:</label>
                  <input
                    type="file"
                    name="photo"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>

                {formErrors.submit && (
                  <div className="form-error">{formErrors.submit}</div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeForm}
                    disabled={formSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showDeleteModal && facultyToDelete && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Подтверждение удаления</h3>
              <button className="close-modal-btn" onClick={closeDeleteModal}>
                &times;
              </button>
            </div>
            <div className="modal-content">
              <p>Вы уверены, что хотите удалить преподавателя <strong>{facultyToDelete.name}</strong>?</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeDeleteModal}>
                Отмена
              </button>
              <button className="delete-btn" onClick={deleteFaculty}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dept-tabs">
        {departments.map(dept => (
          <button
            key={dept.id}
            className={`dept-tab ${currentDepartment === dept.id ? 'active' : ''}`}
            onClick={() => changeDepartment(dept.id)}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {filteredFaculty.length === 0 ? (
        <div className="no-members">Нет преподавателей на этой кафедре</div>
      ) : (
        <>
          <div className="slider-container">
            <button className="slider-arrow left" onClick={prevFaculty}>
              <svg viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="faculty-card">
              <div className="card-photo">
                <img
                  src={currentFaculty.photo_url || "/default_avatar.jpg"}
                  alt={currentFaculty.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default_avatar.jpg";
                  }}
                />
              </div>
              <div className="card-content">
                <h3 className="card-name">{currentFaculty.name}</h3>
                <p className="card-position">{currentFaculty.position}</p>
                {currentFaculty.degree && <p className="card-degree">{currentFaculty.degree}</p>}

                <div className="card-contacts">
                  {currentFaculty.email && (
                    <a href={`mailto:${currentFaculty.email}`} className="contact-item">
                      <svg className="contact-icon" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>{currentFaculty.email}</span>
                    </a>
                  )}

                  {currentFaculty.phone && (
                    <a href={`tel:${currentFaculty.phone.replace(/[^0-9+]/g, '')}`} className="contact-item">
                      <svg className="contact-icon" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{currentFaculty.phone}</span>
                    </a>
                  )}
                </div>

                {isAdmin && (
                  <button 
                    className="delete-faculty-btn"
                    onClick={() => openDeleteModal(currentFaculty)}
                  >
                    Удалить преподавателя
                  </button>
                )}
              </div>
            </div>

            <button className="slider-arrow right" onClick={nextFaculty}>
              <svg viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {filteredFaculty.length > 1 && (
            <div className="slider-dots">
              {filteredFaculty.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${currentIndex === index ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};