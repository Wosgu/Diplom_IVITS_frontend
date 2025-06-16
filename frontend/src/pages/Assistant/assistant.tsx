import React, { useState, useRef, useEffect } from 'react';
import './assistant.css';

type Message = {
  text: string | React.ReactNode;
  isUser: boolean;
};

export const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Приветственное сообщение при первом открытии
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Привет! Я ваш виртуальный помощник. Чем могу помочь?",
          isUser: false
        },
        {
          text: "Вы можете спросить меня о программах обучения, корпусах университета или других вопросах.",
          isUser: false
        }
      ]);
    }
  }, [isOpen]);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Обработчик клика вне модального окна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Добавляем сообщение пользователя
    const userMessage: Message = { text: inputValue, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Имитация задержки ответа бота
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage: Message = { text: botResponse, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const generateBotResponse = (message: string): React.ReactNode => {
    const lowerCaseMessage = message.toLowerCase();

    // Приветствие
    if (lowerCaseMessage.includes('привет') || lowerCaseMessage.includes('здравствуй')) {
      return "Привет! Рад вас видеть. Чем могу помочь?";
    }

    // Поступление, абитуриенты
    if (lowerCaseMessage.includes('абитур') || 
        lowerCaseMessage.includes('поступ') || 
        lowerCaseMessage.includes('направлен') || 
        lowerCaseMessage.includes('подготовк') || 
        lowerCaseMessage.includes('поступать') ||
        lowerCaseMessage.includes('экзамен') ||
        lowerCaseMessage.includes('егэ') ||
        lowerCaseMessage.includes('олимпиад')) {
      return (
        <>
          Всю информацию для абитуриентов вы можете найти на странице{' '}
          <a href="/abitur" className="assistant-link">Абитуриенту</a>. Там представлены программы обучения, 
          правила приема, вступительные испытания и другая полезная информация.
        </>
      );
    }

    // Новости, события
    if (lowerCaseMessage.includes('новост') || 
        lowerCaseMessage.includes('событи') || 
        lowerCaseMessage.includes('мероприят') ||
        lowerCaseMessage.includes('интересн') ||
        lowerCaseMessage.includes('активност') ||
        lowerCaseMessage.includes('жизн') && lowerCaseMessage.includes('институт')) {
      return (
        <>
          Обо всех событиях и новостях института можно узнать на странице{' '}
          <a href="/lifeinst" className="assistant-link">Жизнь института</a>.
        </>
      );
    }

    // Аудитории, корпус
    if (lowerCaseMessage.includes('аудитор') || 
        lowerCaseMessage.includes('корпус') || 
        lowerCaseMessage.includes('здан') ||
        lowerCaseMessage.includes('кабинет') ||
        lowerCaseMessage.includes('лаборатор') ||
        lowerCaseMessage.includes('наполнен') && lowerCaseMessage.includes('корпус')) {
      return (
        <>
          Информацию о корпусах и аудиториях вы можете найти в разделе{' '}
          <a href="/museum" className="assistant-link">Музей</a>.
        </>
      );
    }

    // Документы
    if (lowerCaseMessage.includes('документ') || 
        lowerCaseMessage.includes('норматив') || 
        lowerCaseMessage.includes('справочн') ||
        lowerCaseMessage.includes('положен') ||
        lowerCaseMessage.includes('регламент') ||
        lowerCaseMessage.includes('правил')) {
      return (
        <>
          Справочно-нормативная документация доступна на странице{' '}
          <a href="/documents" className="assistant-link">Документы</a>.
        </>
      );
    }

    // Об институте
    if (lowerCaseMessage.includes('институт') || 
        lowerCaseMessage.includes('истори') || 
        lowerCaseMessage.includes('преподавател') ||
        lowerCaseMessage.includes('контакт') ||
        lowerCaseMessage.includes('организац') ||
        lowerCaseMessage.includes('сведен') ||
        lowerCaseMessage.includes('об институте') ||
        lowerCaseMessage.includes('личность')) {
      return (
        <>
          Подробная информация об институте доступна на странице{' '}
          <a href="/about" className="assistant-link">Сведения об организации</a>.
        </>
      );
    }

    // Расписание
    if (lowerCaseMessage.includes('расписан') || 
        lowerCaseMessage.includes('пары') || 
        lowerCaseMessage.includes('заняти') ||
        lowerCaseMessage.includes('график') ||
        lowerCaseMessage.includes('распис')) {
      return "Расписание занятий доступно в личном кабинете студента или на странице расписания.";
    }

    // Благодарность
    if (lowerCaseMessage.includes('спасибо') || 
        lowerCaseMessage.includes('благодар') || 
        lowerCaseMessage.includes('помог')) {
      return "Пожалуйста! Всегда рад помочь. Обращайтесь, если будут еще вопросы.";
    }

    // Прощание
    if (lowerCaseMessage.includes('пока') || 
        lowerCaseMessage.includes('до свидан') || 
        lowerCaseMessage.includes('прощай')) {
      return "До свидания! Хорошего дня!";
    }

    // Неизвестный вопрос
    return (
      <>
        Извините, я не совсем понял ваш вопрос. Можете переформулировать?<br />
        Я могу помочь с информацией о:<br />
        - Поступлении и программах обучения<br />
        - Новостях и событиях института<br />
        - Корпусах и аудиториях<br />
        - Документах<br />
        - Общей информации об институте
      </>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="assistant-container">
      {isOpen ? (
        <div ref={modalRef} className="assistant-modal">
          <div className="assistant-modal-header">
            <h3>Виртуальный помощник</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="assistant-close-button"
            >
              ×
            </button>
          </div>
          
          <div className="assistant-chat-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`assistant-message ${message.isUser ? 'assistant-user-message' : 'assistant-bot-message'}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="assistant-input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваш вопрос..."
              className="assistant-input-field"
            />
            <button 
              onClick={handleSendMessage} 
              className="assistant-send-button"
              disabled={!inputValue.trim()}
            >
              Отправить
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)} 
          className="assistant-button"
          aria-label="Открыть чат с помощником"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};