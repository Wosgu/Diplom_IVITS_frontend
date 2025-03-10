import { useState } from 'react';
import './login.css';  
import { Eye, EyeOff } from 'lucide-react'; // Иконки глаза

interface PasswordInputProps {
    placeholder: string;
  }

export const PasswordInput: React.FC<PasswordInputProps> = ({ placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-container">
      <input 
        type={showPassword ? "text" : "password"} 
        placeholder={placeholder} 
        required 
      />
      <button 
        type="button" 
        className="eye-button" 
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye size={16} /> :  <EyeOff size={16} />}
      </button>
    </div>
  );
};

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);

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
        <form className="auth-form">
          <h2>Регистрация</h2>
          <input type="text" placeholder="Имя" required />
          <input type="text" placeholder="Фамилия" required />
          <select required>
            <option value="">Выберите роль</option>
            <option value="student">Студент</option>
            <option value="teacher">Преподаватель</option>
          </select>
          <PasswordInput placeholder="Пароль" />
          <PasswordInput placeholder="Повторите пароль" />
          <button type="submit">Зарегистрироваться</button>
        </form>
      ) : (
        <form className="auth-form">
          <h2>Вход</h2>
          <input type="text" placeholder="Логин" required />
          <PasswordInput placeholder="Пароль" />
          <button type="submit">Войти</button>
        </form>
      )}
    </div>
  );
};
