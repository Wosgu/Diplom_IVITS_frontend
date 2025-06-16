// Общие регулярные выражения
const nameRegex = /^[А-Я][а-яА-Я-]*$/; // Только кириллица, начинается с заглавной
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[_!@#$%^&*]).{6,}$/;
const phoneRegex = /^7\d{10}$/; // Формат: 7XXXXXXXXXX
const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Логин: латиница, цифры, подчеркивание

// Валидация логина
export const validateLogin = (username: string, password: string) => {
  const errors: { username?: string; password?: string } = {};

  if (!username.trim()) {
    errors.username = "Введите логин";
  } else if (!usernameRegex.test(username)) {
    errors.username = "Проверьте правильность ввода логина";
  }

  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Проверьте правильность ввода пароля";
  }

  return errors;
};

// Валидация регистрации
export const validateRegister = (
  username: string,
  phone: string,
  firstName: string,
  lastName: string,
  middleName: string,
  password: string,
  confirmPassword: string,
  isAgreementChecked: boolean
) => {
  const errors: {
    username?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    password?: string;
    confirmPassword?: string;
    agreement?: string;
  } = {};

  // Валидация логина
  if (!username.trim()) {
    errors.username = "Введите логин";
  } else if (!usernameRegex.test(username)) {
    errors.username = "Логин должен содержать только латинские буквы, цифры и подчеркивание (минимум 3 символа)";
  }

  // Валидация телефона
  if (!phone.trim()) {
    errors.phone = "Введите номер телефона";
  } else if (!phoneRegex.test(phone)) {
    errors.phone = "Номер телефона должен состоять из 11 цифр и начинаться с 7";
  }

  // Валидация имени
  if (!firstName.trim()) {
    errors.firstName = "Введите имя";
  } else if (!nameRegex.test(firstName)) {
    errors.firstName = "Имя должно начинаться с заглавной буквы и содержать только кириллицу";
  } else if (firstName.length < 2) {
    errors.firstName = "Имя должно содержать минимум 2 буквы";
  }

  // Валидация фамилии
  if (!lastName.trim()) {
    errors.lastName = "Введите фамилию";
  } else if (!nameRegex.test(lastName)) {
    errors.lastName = "Фамилия должна начинаться с заглавной буквы и содержать только кириллицу";
  } else if (lastName.length < 2) {
    errors.lastName = "Фамилия должна содержать минимум 2 буквы";
  }

  // Валидация отчества (необязательное поле)
  if (middleName && middleName.trim()) {
    if (!nameRegex.test(middleName)) {
      errors.middleName = "Отчество должно начинаться с заглавной буквы и содержать только кириллицу (или оставьте пустым)";
    } else if (middleName.length < 2) {
      errors.middleName = "Отчество должно содержать минимум 2 буквы (или оставьте пустым)";
    }
  }

  // Валидация пароля
  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Пароль должен содержать: минимум 6 символов, цифру, заглавную и строчную букву, спецсимвол(_!@#$%^&*)";
  }

  // Подтверждение пароля
  if (!confirmPassword.trim()) {
    errors.confirmPassword = "Подтвердите пароль";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  // Соглашение
  if (!isAgreementChecked) {
    errors.agreement = "Необходимо принять пользовательское соглашение";
  }

  return errors;
};

export const validateVerificationCode = (code: string) => {
  const errors: { code?: string } = {};
  if (!/^\d{6}$/.test(code)) {
    errors.code = "Код должен содержать 6 цифр";
  }
  return errors;
};