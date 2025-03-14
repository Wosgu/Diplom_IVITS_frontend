import { useState } from 'react';
import axios from 'axios';
import './login.css';
import { Eye, EyeOff } from 'lucide-react';

// Компонент для ввода пароля с кнопкой "показать/скрыть пароль"
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
        name={name}  // Указываем name для синхронизации с состоянием
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
    first_name: '',
    last_name: '',
    patronymic: '',
    password: '',
    password2: ''
  });

  // Функция обновления значений в инпутах
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });  // Обновляем правильное поле
  };

  // Регистрация пользователя
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
      console.log('Регистрация успешна:', response.data);
      alert('Вы успешно зарегистрированы!');
    } catch (error: any) {
      console.error('Ошибка при регистрации:', error);
      alert(error.response?.data || error.message);
    }
  };

  // Логин пользователя
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: formData.username,
        password: formData.password
      });

      console.log('Вход выполнен:', response.data);
      alert('Вы успешно вошли в систему!');
    } catch (error: any) {
      console.error('Ошибка при входе:', error);
      alert(error.response?.data || error.message);
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
          <input type="text" name="first_name" placeholder="Имя" required value={formData.first_name} onChange={handleChange} />
          <input type="text" name="last_name" placeholder="Фамилия" required value={formData.last_name} onChange={handleChange} />
          <input type="text" name="patronymic" placeholder="Отчество" required value={formData.patronymic} onChange={handleChange} />
          <PasswordInput name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} />
          <PasswordInput name="password2" placeholder="Повторите пароль" value={formData.password2} onChange={handleChange} />
          <button type="submit">Зарегистрироваться</button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleLogin}>
          <h2>Вход</h2>
          <input type="text" name="username" placeholder="Никнейм" required value={formData.username} onChange={handleChange} />
          <PasswordInput name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} />
          <button type="submit">Войти</button>
        </form>
      )}
    </div>
  );
};
