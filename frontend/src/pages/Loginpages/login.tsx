import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import axios from 'axios';
import './login.css';
import { Eye, EyeOff } from 'lucide-react';
import { validateRegister } from '../../validations/loginvalid';

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ placeholder, value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-container">
      <input 
        type={showPassword ? "text" : "password"} 
        placeholder={placeholder} 
        required 
        value={value} 
        onChange={onChange}
        name={name}
      />
      <button 
        type="button" 
        className="eye-button" 
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
      </button>
    </div>
  );
};

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState<{
    nickname?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigate = useNavigate(); // Вызов useNavigate на верхнем уровне

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация данных
    const validationErrors = validateRegister(
      formData.username,
      formData.email,
      formData.first_name,
      formData.last_name,
      formData.middle_name,
      formData.password,
      formData.password2
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await axios.post(
        'https://tamik327.pythonanywhere.com/api/register/', 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('Регистрация успешна:', response.data);
      alert('Вы успешно зарегистрированы!');
    } catch (error: any) {
      console.error('Ошибка при регистрации:', error);
      if (error.response) {
        console.error('Данные ответа:', error.response.data);
        alert(`Ошибка: ${JSON.stringify(error.response.data)}`);
      } else {
        alert(error.message);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('https://tamik327.pythonanywhere.com/api/authorization/', {
        email: formData.email,
        password: formData.password
      });
  
      // Сохраняем токен в localStorage
      const { access, refresh } = response.data; // Предположим, что сервер возвращает access и refresh токены
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
  
      console.log('Вход выполнен:', response.data);
      alert('Вы успешно вошли в систему!');
  
      // Перенаправляем пользователя на главную страницу
      navigate('/'); // Используем navigate для перенаправления
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
  
      if (error.response) {
        // Ошибка от сервера (например, 4xx или 5xx)
        const { status, data } = error.response;
  
        switch (status) {
          case 400:
            alert('Некорректные данные. Проверьте введенные данные и попробуйте снова.');
            break;
          case 401:
            alert('Неверный email или пароль. Проверьте введенные данные и попробуйте снова.');
            break;
          case 404:
            alert('Сервер не найден. Пожалуйста, попробуйте позже.');
            break;
          case 500:
            alert('Ошибка на сервере. Пожалуйста, попробуйте позже.');
            break;
          default:
            // Вывод деталей ошибки, если они есть
            if (data.detail) {
              alert(`Ошибка: ${data.detail}`);
            } else if (data.message) {
              alert(`Ошибка: ${data.message}`);
            } else {
              alert(`Ошибка: ${JSON.stringify(data)}`);
            }
        }
      } else if (error.request) {
        // Ошибка, если сервер не ответил
        alert('Сервер не ответил. Проверьте подключение к интернету и попробуйте снова.');
      } else {
        // Другие ошибки (например, ошибка в коде)
        alert(`Ошибка: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="toggle-buttons">
        <button 
          className={!isRegister ? "active" : ""} 
          onClick={() => setIsRegister(false)}
        >
          Вход
        </button>
        <button 
          className={isRegister ? "active" : ""} 
          onClick={() => setIsRegister(true)}
        >
          Регистрация
        </button>
      </div>

      {isRegister ? (
        <form className="auth-form" onSubmit={handleRegister}>
          <h2>Регистрация</h2>
          <input type="text" name="username" placeholder="Никнейм" required value={formData.username} onChange={handleChange} />
          {errors.nickname && <div className="error-message">{errors.nickname}</div>}
          <input type="text" name="email" placeholder="Почта" required value={formData.email} onChange={handleChange} />
          {errors.email && <div className="error-message">{errors.email}</div>}
          <input type="text" name="first_name" placeholder="Имя" required value={formData.first_name} onChange={handleChange} />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          <input type="text" name="last_name" placeholder="Фамилия" required value={formData.last_name} onChange={handleChange} />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          <input type="text" name="middle_name" placeholder="Отчество" required value={formData.middle_name} onChange={handleChange} />
          {errors.middleName && <div className="error-message">{errors.middleName}</div>}
          <PasswordInput name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} />
          {errors.password && <div className="error-message">{errors.password}</div>}
          <PasswordInput name="password2" placeholder="Повторите пароль" value={formData.password2} onChange={handleChange} />
          {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          <button type="submit">Зарегистрироваться</button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Вход</h2>
          <input type="text" name="email" placeholder="E-mail" required value={formData.email} onChange={handleChange} />
          {errors.email && <div className="error-message">{errors.email}</div>}
          <PasswordInput name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} />
          {errors.password && <div className="error-message">{errors.password}</div>}
          <button type="submit">Войти</button>
        </form>
      )}
    </div>
  );
};