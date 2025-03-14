export const validateLogin = (login: string, password: string) => {
    const errors: { login?: string; password?: string } = {};
  
    if (!login.trim()) {
      errors.login = "Введите логин";
    }
  
    if (!password.trim()) {
      errors.password = "Введите пароль";
    } else if (password.length < 6) {
      errors.password = "Пароль должен содержать минимум 6 символов";
    }
  
    return errors;
  };
  
  const nameRegex = /^[А-Яа-яA-Za-z]+$/;
  
  export const validateRegister = (
    nickname: string,
    firstName: string,
    lastName: string,
    middleName: string,
    password: string,
    confirmPassword: string
  ) => {
    const errors: {
      nickname?: string;
      firstName?: string;
      lastName?: string;
      middleName?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
  
    if (!nickname.trim()) {
      errors.nickname = "Введите никнейм";
    }
    if (!firstName.trim()) {
      errors.firstName = "Введите имя";
    } else if (!nameRegex.test(firstName)) {
      errors.firstName = "Имя должно содержать только буквы";
    }
  
    if (!lastName.trim()) {
      errors.lastName = "Введите фамилию";
    } else if (!nameRegex.test(lastName)) {
      errors.lastName = "Фамилия должна содержать только буквы";
    }
  
    if (!middleName.trim()) {
      errors.middleName = "Введите отчество";
    } else if (!nameRegex.test(middleName)) {
      errors.middleName = "Отчество должно содержать только буквы";
    }
  
    if (!password.trim()) {
      errors.password = "Введите пароль";
    } else if (password.length < 6) {
      errors.password = "Пароль должен содержать минимум 6 символов";
    }
  
    if (password !== confirmPassword) {
      errors.confirmPassword = "Пароли не совпадают";
    }
  
    return errors;
  };
  