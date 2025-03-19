export const validateLogin = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};

  if (!email.trim()) {
    errors.email = "Введите e-mail";
  } else if (!emailRegex.test(email)) {
    errors.email = "Email должен быть в формате example@gmail.com";
  }

  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Пароль должен содержать минимум 6 символов, включая хотя бы одну цифру, одну заглавную букву, одну строчную букву и один спецсимвол (например, _)";
  }

  return errors;
};

const nameRegex = /^[А-Яа-яA-Za-z]{2,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[_!@#$%^&*]).{6,}$/;

export const validateRegister = (
  nickname: string,
  email: string,
  firstName: string,
  lastName: string,
  middleName: string,
  password: string,
  confirmPassword: string
) => {
  const errors: {
    nickname?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  if (!nickname.trim()) {
    errors.nickname = "Введите никнейм";
  }

  if (!email.trim()) {
    errors.email = "Введите email";
  } else if (!emailRegex.test(email)) {
    errors.email = "Email должен быть в формате example@gmail.com или example@mail.ru";
  }

  if (!firstName.trim()) {
    errors.firstName = "Введите имя";
  } else if (!nameRegex.test(firstName)) {
    errors.firstName = "Имя должно содержать только буквы и быть минимум 2 символа";
  }

  if (!lastName.trim()) {
    errors.lastName = "Введите фамилию";
  } else if (!nameRegex.test(lastName)) {
    errors.lastName = "Фамилия должна содержать только буквы и быть минимум 2 символа";
  }

  if (!middleName.trim()) {
    errors.middleName = "Введите отчество";
  } else if (!nameRegex.test(middleName)) {
    errors.middleName = "Отчество должно содержать только буквы и быть минимум 2 символа";
  }

  if (!password.trim()) {
    errors.password = "Введите пароль";
  } else if (!passwordRegex.test(password)) {
    errors.password = "Пароль должен содержать минимум 6 символов, включая хотя бы одну цифру, одну заглавную букву, одну строчную букву и один спецсимвол (например, _)";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Пароли не совпадают";
  }

  return errors;
};