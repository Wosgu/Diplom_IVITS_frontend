import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { validateRegister, validateLogin } from '../../validations/loginvalid';
import './login.css';

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
        type={showPassword ? "text" : "password"} 
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
  const [searchParams] = useSearchParams();
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
  const [successMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Обработка callback от VK
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleVKCallback(code);
    }
  }, [searchParams]);

  const handleVKCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`https://tamik327.pythonanywhere.com/auth/vk/callback/?code=${code}`);
      
      if (data.status === 'success' && data.access_token && data.refresh_token) {
        // Сохраняем токены и редиректим на главную
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        navigate('/');
      } else {
        setErrors({ general: 'Не удалось авторизоваться через VK' });
      }
    } catch (error) {
      setErrors({ general: 'Ошибка авторизации через VK' });
      console.error('VK auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVKLogin = () => {
    window.location.href = 'https://tamik327.pythonanywhere.com/auth/vk/init/';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value.startsWith('7') ? `+7${value.slice(1)}` : `+7${value}`;
    setFormData(prev => ({ ...prev, phone: formattedValue.slice(0, 12) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmCode = async () => {
    try {
      await axios.post('https://tamik327.pythonanywhere.com/api/register/confirm/', {
        phone: formData.phone,
        code: confirmationCode
      });

      // После подтверждения сразу логиним пользователя
      try {
        const { data } = await axios.post(
          'https://tamik327.pythonanywhere.com/api/login/phone/',
          {
            phone: formData.phone.replace('+', ''),
            password: formData.password
          }
        );

        if (data.access && data.refresh) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          navigate('/');
        }
      } catch (loginError) {
        setErrors({ general: 'Авторизация после регистрации не удалась' });
      }

    } catch (error) {
      setErrors({ confirmation: 'Неверный код подтверждения' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
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

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        await axios.post('https://tamik327.pythonanywhere.com/api/register/init/', {
          username: formData.username,
          phone: formData.phone,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          password2: formData.confirmPassword
        });
        setShowConfirmation(true);
      } catch (error: any) {
        if (error.response?.data?.phone) {
          setErrors({ phone: error.response.data.phone[0] });
        }
      }
    } else {
      const validationErrors = validateLogin(formData.phone, formData.password);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      try {
        const { data } = await axios.post(
          'https://tamik327.pythonanywhere.com/api/login/phone/',
          {
            phone: formData.phone.replace('+', ''),
            password: formData.password
          }
        );

        if (data.access && data.refresh) {
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          navigate('/');
        } else {
          setErrors({ general: 'Не удалось получить токены авторизации' });
        }
      } catch (error: any) {
        if (error.response?.status === 401) {
          setErrors({ general: 'Неверный телефон или пароль' });
        } else {
          setErrors({ general: 'Ошибка сервера. Попробуйте позже.' });
        }
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-illustration">
        <div className="illustration-placeholder"></div>
      </div>

      <div className="auth-content">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{showConfirmation ? 'Подтверждение' : isRegister ? 'Создать аккаунт' : 'Добро пожаловать'}</h2>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {isLoading && <div className="loading-overlay">Загрузка...</div>}

          {showConfirmation ? (
            <div className="confirmation-section">
              <p>Пожалуйста, введите код, отправленный на <strong>{formData.phone}</strong></p>
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="6-значный код"
                maxLength={6}
                className={errors.confirmation ? 'error' : ''}
              />
              {errors.confirmation && <span className="error-message">{errors.confirmation}</span>}
              <button 
                type="button" 
                className="submit-button"
                onClick={handleConfirmCode}
              >
                Подтвердить
              </button>
            </div>
          ) : (
            <>
              {isRegister && (
                <>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Никнейм"
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-message">{errors.username}</span>}
                </>
              )}

              <input
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="+7XXXXXXXXXX"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}

              {isRegister && (
                <>
                  <div className="name-group">
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Имя"
                      className={errors.firstName ? 'error' : ''}
                    />
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Фамилия"
                      className={errors.lastName ? 'error' : ''}
                    />
                  </div>
                  
                  <input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Отчество"
                    className={errors.middleName ? 'error' : ''}
                  />
                  {errors.middleName && <span className="error-message">{errors.middleName}</span>}
                </>
              )}

              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Пароль"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}

              {isRegister && (
                <>
                  <PasswordInput
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Повторите пароль"
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

                  <label className="agreement-checkbox">
                    <input
                      type="checkbox"
                      checked={isAgreementChecked}
                      onChange={(e) => setIsAgreementChecked(e.target.checked)}
                    />
                    Принимаю{' '}
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

              {errors.general && <div className="error-message general-error">{errors.general}</div>}

              <button type="submit" className="submit-button">
                {isRegister ? 'Зарегистрироваться' : 'Войти'}
              </button>

              <button 
                type="button" 
                className="vk-login-button"
                onClick={handleVKLogin}
              >
                <svg className="vk-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12.65 18.24c-5.59 0-8.65-3.82-8.85-10.23h3.07c.15 4.88 2.44 6.97 4.46 7.37V8.01h2.91v4.23c2-.2 4.1-2.09 4.8-4.23h2.91c-.62 3.52-3.29 6.11-5.9 7.03 2.61.76 5.34 3.03 6.29 7.2h-3.36c-.72-2.62-2.86-4.38-5.33-4.6v4.6h-.4z"/>
                </svg>
                {isRegister ? 'Зарегистрироваться через VK' : 'Войти с VK ID'}
              </button>

              <div className="auth-switch">
                {isRegister ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
                <button
                  type="button"
                  className="switch-button"
                  onClick={() => setIsRegister(!isRegister)}
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
                {/* Текст соглашения */}
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