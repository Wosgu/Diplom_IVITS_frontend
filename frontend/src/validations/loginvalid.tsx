// validators.ts

// Общие регулярные выражения
const nameRegex = /^[А-Яа-яA-Za-z]{2,}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[_!@#$%^&*]).{6,}$/;
const phoneRegex = /^\+7\d{10}$/;

// Валидация логина (по телефону)
export const validateLogin = (phone: string, password: string) => {
  const errors: { phone?: string; password?: string } = {};

  if (!phone.trim()) {
    errors.phone = "Введите номер телефона";
  } else if (!phoneRegex.test(phone)) {
    errors.phone = "Формат: +7XXXXXXXXXX";
  }

  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Пароль должен содержать: 6+ символов, цифру, заглавную/строчную букву и спецсимвол";
  }

  return errors;
};

// Валидация регистрации (без email)
export const validateRegister = (
  nickname: string,
  phone: string,
  firstName: string,
  lastName: string,
  middleName: string,
  password: string,
  confirmPassword: string,
  isAgreementChecked: boolean
) => {
  const errors: {
    nickname?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    password?: string;
    confirmPassword?: string;
    agreement?: string;
  } = {};

  if (!nickname.trim()) errors.nickname = "Введите никнейм";
  
  if (!phone.trim()) {
    errors.phone = "Введите номер телефона";
  } else if (!phoneRegex.test(phone)) {
    errors.phone = "Формат: +7XXXXXXXXXX";
  }

  if (!firstName.trim()) {
    errors.firstName = "Введите имя";
  } else if (!nameRegex.test(firstName)) {
    errors.firstName = "Только буквы, минимум 2";
  }

  if (!lastName.trim()) {
    errors.lastName = "Введите фамилию";
  } else if (!nameRegex.test(lastName)) {
    errors.lastName = "Только буквы, минимум 2";
  }

  if (!middleName.trim()) {
    errors.middleName = "Введите отчество";
  } else if (!nameRegex.test(middleName)) {
    errors.middleName = "Только буквы, минимум 2";
  }

  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Не соответствует требованиям безопасности";
  }

  if (password !== confirmPassword) errors.confirmPassword = "Пароли не совпадают";
  if (!isAgreementChecked) errors.agreement = "Примите пользовательское соглашение";

  return errors;
};

export const validateVerificationCode = (code: string) => {
  const errors: { code?: string } = {};
  if (!/^\d{6}$/.test(code)) errors.code = "Код должен содержать 6 цифр";
  return errors;
};