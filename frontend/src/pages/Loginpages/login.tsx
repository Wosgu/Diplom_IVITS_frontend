import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { validateRegister, validateLogin } from '../../validations/loginvalid';
import { useAuth } from '../../Context/AuthContext';
import { VKAuthButton } from './VK/VKAuthButton';
import './login.css';

const API_BASE_URL = import.meta.env.VITE_BASE_URL_ENDPOINTS;

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ placeholder, value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-container">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
      <button
        type="button"
        className="eye-button"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
};

export const Login = () => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    firstName: '',
    lastName: '',
    middleName: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.search.includes('access_token')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let cleaned = value.replace(/\D/g, '');
      if (!cleaned.startsWith('7') && cleaned.length > 0) {
        cleaned = '7' + cleaned;
      }
      const formatted = cleaned.slice(0, 11);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    if (['firstName', 'lastName', 'middleName'].includes(name)) {
      const formatted = value.charAt(0).toUpperCase() + value.slice(1);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const resendConfirmationCode = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/register/init/`, {
        username: formData.username,
        phone: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
        ...(formData.middleName ? { middle_name: formData.middleName } : {}),
        password: formData.password,
        password2: formData.confirmPassword,
      }, { 
        withCredentials: true 
      });
      
      if (res.status === 200) {
        setErrors({});
      }
    } catch (error: any) {
      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        
        if (error.response.data.username) {
          apiErrors.username = Array.isArray(error.response.data.username) 
            ? error.response.data.username[0] 
            : error.response.data.username;
        }
        if (error.response.data.phone) {
          apiErrors.phone = Array.isArray(error.response.data.phone) 
            ? error.response.data.phone[0] 
            : error.response.data.phone;
        }
        
        setErrors(apiErrors);
      } else {
        setErrors({ general: 'Ошибка соединения с сервером. Пожалуйста, попробуйте позже.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register/confirm/`, {
        phone: formData.phone,
        code: confirmationCode,
      }, { 
        withCredentials: true 
      });

      if (response.status === 200) {
        setShowConfirmation(false);
        setRegistrationSuccess(true);
        setIsRegister(false);
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      setErrors({ confirmation: 'Неверный код подтверждения' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    if (isRegister) {
      const validationErrors = validateRegister(
        formData.username,
        formData.phone,
        formData.firstName,
        formData.lastName,
        formData.middleName,
        formData.password,
        formData.confirmPassword,
        isAgreementChecked
      );
      if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

      setIsLoading(true);
      try {
        const res = await axios.post(`${API_BASE_URL}/api/register/init/`, {
          username: formData.username,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          ...(formData.middleName ? { middle_name: formData.middleName } : {}),
          password: formData.password,
          password2: formData.confirmPassword,
        }, { 
          withCredentials: true 
        });
        
        if (res.status === 200) {
          setShowConfirmation(true);
        }
      } catch (error: any) {
        if (error.response?.data) {
          const apiErrors: Record<string, string> = {};
          
          if (error.response.data.username) {
            apiErrors.username = Array.isArray(error.response.data.username) 
              ? error.response.data.username[0] 
              : error.response.data.username;
          }
          if (error.response.data.phone) {
            apiErrors.phone = Array.isArray(error.response.data.phone) 
              ? error.response.data.phone[0] 
              : error.response.data.phone;
          }
          if (error.response.data.password) {
            apiErrors.password = Array.isArray(error.response.data.password) 
              ? error.response.data.password[0] 
              : error.response.data.password;
          }
          if (error.response.data.non_field_errors) {
            apiErrors.general = Array.isArray(error.response.data.non_field_errors) 
              ? error.response.data.non_field_errors[0] 
              : error.response.data.non_field_errors;
          }
          
          setErrors(apiErrors);
          
          if (Object.keys(apiErrors).length === 0) {
            setServerError('Ошибка регистрации. Пожалуйста, проверьте введенные данные.');
          }
        } else {
          setServerError('Ошибка соединения с сервером. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      const validationErrors = validateLogin(formData.username, formData.password);
      if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);

      setIsLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/login/`, {
          username: formData.username,
          password: formData.password,
        }, { 
          withCredentials: true 
        });

        if (response.status === 200) {
          const userData = {
            id: response.data.user_id,
            username: response.data.username,
            phone: response.data.phone || null,
            first_name: response.data.first_name || '',
            last_name: response.data.last_name || '',
            middle_name: response.data.middle_name || '',
            role: 'user',
            email: response.data.email || '',
            is_active: true
          };
          await login(response.data.access, userData);
          navigate('/');
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          setErrors({ general: 'Неверный логин или пароль' });
        } else {
          setErrors({ general: 'Ошибка сервера. Пожалуйста, попробуйте позже.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-illustration">
        <div className="illustration-placeholder" >
          <img className='illustr' src='/backgroungimg.jpg'/>
        </div>
      </div>

      <div className="auth-content">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{showConfirmation ? 'Подтверждение' : isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}</h2>

          {isLoading && <div className="loading-overlay">Загрузка...</div>}

          {registrationSuccess && (
            <div className="success-message">
              Регистрация успешна! Теперь вы можете войти, используя свои учетные данные.
            </div>
          )}

          {showConfirmation ? (
            <div className="confirmation-section">
              <p>Пожалуйста, введите код, отправленный на номер <strong>{formData.phone}</strong></p>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="6-значный код"
                maxLength={6}
                className={errors.confirmation ? 'error' : ''}
              />
              {errors.confirmation && <span className="error-message">{errors.confirmation}</span>}
              
              <div className="confirmation-buttons">
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={handleConfirmCode}
                  disabled={isLoading}
                >
                  {isLoading ? 'Проверка...' : 'Подтвердить'}
                </button>
                
                <button
                  type="button"
                  className="resend-button"
                  onClick={resendConfirmationCode}
                  disabled={isLoading}
                >
                  Отправить код ещё раз
                </button>
              </div>
            </div>
          ) : (
            <>
              {!isRegister && (
                <>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Логин"
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </>
              )}

              {isRegister && (
                <>
                  <div className="form-field">
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Логин"
                      className={errors.username ? 'error' : ''}
                    />
                    {errors.username && <span className="error-message">{errors.username}</span>}
                  </div>

                  <div className="form-field">
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Телефон (начинайте ввод с цифры)"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>

                  <div className="name-group">
                    <div className="form-field">
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Имя"
                        className={errors.firstName ? 'error' : ''}
                      />
                      {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>
                    <div className="form-field">
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Фамилия"
                        className={errors.lastName ? 'error' : ''}
                      />
                      {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <input
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      placeholder="Отчество (необязательно)"
                      className={errors.middleName ? 'error' : ''}
                    />
                    {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                  </div>
                </>
              )}

              <div className="form-field">
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Пароль"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {isRegister && (
                <>
                  <div className="form-field">
                    <PasswordInput
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Повторите пароль"
                    />
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                  </div>

                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      checked={isAgreementChecked}
                      onChange={(e) => setIsAgreementChecked(e.target.checked)}
                    />
                    Принимаю{'  '}
                    <button
                      type="button"
                      className="agreement-link"
                      onClick={() => setShowAgreement(true)}
                    >
                       пользовательское соглашение
                    </button>
                  </label>
                  {errors.agreement && <span className="error-message">{errors.agreement}</span>}
                </>
              )}

              {serverError && <div className="error-message general-error">{serverError}</div>}
              {errors.general && <div className="error-message general-error">{errors.general}</div>}

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading 
                  ? isRegister ? 'Регистрация...' : 'Вход...'
                  : isRegister ? 'Зарегистрироваться' : 'Войти'}
              </button>

              <VKAuthButton 
                isRegister={isRegister} 
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                setErrors={setErrors}
              />

              <div className="auth-switch">
                {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
                <button
                  type="button"
                  className="switch-button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setRegistrationSuccess(false);
                    setErrors({});
                  }}
                  disabled={isLoading}
                >
                  {isRegister ? 'Войти' : 'Зарегистрироваться'}
                </button>
              </div>
            </>
          )}
        </form>

        {showAgreement && (
          <div className="agreement-modal">
            <div className="modal-content">
              <h3>Пользовательское соглашение</h3>
              <div className="modal-text">
                <p>Здесь должно быть пользовательское соглашение...</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowAgreement(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};