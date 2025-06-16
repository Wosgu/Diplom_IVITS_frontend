import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AuthContext";
import Cookies from "js-cookie";
import "./qiuz.css";

interface EducationLevel {
  id: number;
  name: string;
  code: string;
}

interface QuestionGroup {
  id: number;
  name: string;
  questions: Question[];
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  order: number;
}

interface Option {
  id: number;
  text: string;
}

interface Program {
  id: number;
  program_name: string;
  level: EducationLevel;
  description: string;
}

interface TestSession {
  id: number;
  education_level: string;
  created_at: string;
  completed: boolean;
}

interface TestResult {
  recommended_programs: Program[];
}

interface AnswerPayload {
  question: number;
  answer: number;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const QuizComponent = () => {
  const { isAuthenticated, getAuthHeader } = useAuth();
  const [step, setStep] = useState<"intro" | "loading" | "level" | "groups" | "questions" | "result" | "error" | "auth_required">("intro");
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerPayload[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

  const loadLevels = async () => {
    try {
      setStep("loading");
      const response = await axios.get<Program[]>(
        "https://vits44.ru/api/programs/active/",
        {
          ...getAuthHeader(),
          withCredentials: true
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error("Сервер вернул данные в неожиданном формате");
      }

      const levelsMap = new Map<number, EducationLevel>();
      response.data.forEach(program => {
        if (program.level) {
          levelsMap.set(program.level.id, program.level);
        }
      });

      if (levelsMap.size === 0) {
        throw new Error("Не найдено ни одного уровня образования");
      }

      setLevels(Array.from(levelsMap.values()));
      setStep(isAuthenticated ? "level" : "auth_required");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setStep("auth_required");
      } else {
        console.error("Ошибка загрузки уровней:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        setStep("error");
      }
    }
  };

  const loadQuestionGroups = async (levelId: number) => {
    try {
      if (!isAuthenticated) {
        setStep("auth_required");
        return;
      }

      setStep("loading");
      const response = await axios.get<ApiResponse<QuestionGroup>>(
        `https://vits44.ru/api/question-groups/?level_id=${levelId}`,
        {
          ...getAuthHeader(),
          withCredentials: true
        }
      );

      if (!response.data?.results) {
        throw new Error("Неверный формат групп вопросов");
      }

      const validGroups = response.data.results
        .map(group => ({
          ...group,
          questions: group.questions
            .filter(q => q.options && q.options.length > 0)
            .sort((a, b) => a.order - b.order)
        }))
        .filter(group => group.questions.length > 0);

      if (validGroups.length === 0) {
        throw new Error("Нет доступных групп вопросов с вариантами ответов");
      }

      setQuestionGroups(validGroups);
      setSelectedLevelId(levelId);
      setStep("groups");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setStep("auth_required");
      } else {
        console.error("Ошибка загрузки групп вопросов:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        setStep("error");
      }
    }
  };

  const startTest = async () => {
    try {
      if (!selectedLevelId) {
        throw new Error("Не выбран уровень образования");
      }

      if (!isAuthenticated) {
        setStep("auth_required");
        return;
      }

      const token = Cookies.get('access_token');
      if (!token && isAuthenticated) {
        throw new Error("Требуется авторизация");
      }

      setStep("loading");

      const { data: session } = await axios.post<TestSession>(
        "https://vits44.ru/api/start-test/",
        { level_id: selectedLevelId },
        {
          ...getAuthHeader(),
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { "Authorization": `Bearer ${token}` })
          }
        }
      );

      setSessionId(session.id);

      if (questionGroups.length > 0) {
        setQuestions(questionGroups[0].questions);
        setCurrentQuestionIndex(0);
        setStep("questions");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setStep("auth_required");
      } else {
        console.error("Ошибка начала теста:", err);
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        setStep("error");
      }
    }
  };

  const handleAnswer = (optionId: number) => {
    const question = questions[currentQuestionIndex];
    const newAnswer = {
      question: question.id,
      answer: optionId
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    submitAnswers([newAnswer]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentGroupIndex < questionGroups.length - 1) {
      const nextGroupIndex = currentGroupIndex + 1;
      setCurrentGroupIndex(nextGroupIndex);
      setQuestions(questionGroups[nextGroupIndex].questions);
      setCurrentQuestionIndex(0);
    } else {
      completeTest();
    }
  };

  const submitAnswers = async (answersToSubmit: AnswerPayload[]) => {
    if (!sessionId) {
      console.error("Отсутствует ID сессии тестирования");
      return;
    }

    try {
      await axios.post(
        `https://vits44.ru/api/sessions/${sessionId}/answers/`,
        answersToSubmit,
        {
          ...getAuthHeader(),
          withCredentials: true
        }
      );
    } catch (err) {
      console.error("Ошибка отправки ответов:", err);
    }
  };

  const completeTest = async () => {
    if (!sessionId) {
      setError("Отсутствует ID сессии тестирования");
      setStep("error");
      return;
    }

    try {
      setStep("loading");

      await axios.post(
        `https://vits44.ru/api/sessions/${sessionId}/complete/`,
        {},
        {
          ...getAuthHeader(),
          withCredentials: true
        }
      );

      const { data: result } = await axios.get<TestResult>(
        `https://vits44.ru/api/results/${sessionId}/`,
        {
          ...getAuthHeader(),
          withCredentials: true
        }
      );

      setResult(result);
      setStep("result");
    } catch (err) {
      console.error("Ошибка завершения теста:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setStep("error");
    }
  };

  const restartTest = () => {
    setStep("level");
    setQuestionGroups([]);
    setCurrentGroupIndex(0);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setError(null);
    setSessionId(null);
    setSelectedLevelId(null);
  };

  const startQuiz = () => {
    if (isAuthenticated) {
      loadLevels();
    } else {
      setStep("auth_required");
    }
  };

  const goToLogin = () => {
    window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
  };

  useEffect(() => {
    if (step === "intro") {
      // Предзагрузка данных при монтировании
      loadLevels();
    }
  }, [isAuthenticated]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentGroup = questionGroups[currentGroupIndex];

  return (
    <div className="quiz-container">
      {step === "intro" && (
        <div className="quiz-intro">
          <div className="intro-card">
            <h2>Хотели бы узнать, какое направление и профессия вам подойдут?</h2>
            <p>Пройдите наш тест и получите персональные рекомендации</p>
            <button className="start-quiz-button" onClick={startQuiz}>
              Пройти тест
            </button>
          </div>
        </div>
      )}

      {step === "loading" && (
        <div className="quiz-loading">
          <div className="spinner"></div>
          <p>Загрузка...</p>
        </div>
      )}

      {step === "auth_required" && (
        <div className="auth-message">
          <p>Пожалуйста авторизуйтесь, для прохождения теста</p>
          <button className="auth-button" onClick={goToLogin}>
            Авторизоваться
          </button>
        </div>
      )}

      {step === "level" && (
        <div className="level-selection">
          <h2>Выберите уровень образования</h2>
          <div className="levels-grid">
            {levels.map(level => (
              <button
                key={`level-${level.id}`}
                className="level-card"
                onClick={() => loadQuestionGroups(level.id)}
              >
                <span>{level.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "groups" && (
        <div className="groups-selection">
          <h2>Группы вопросов</h2>
          <div className="groups-list">
            {questionGroups.map((group, index) => (
              <div key={`group-${group.id}`} className="group-item">
                <h3>{group.name}</h3>
                <p>Количество вопросов: {group.questions.length}</p>
                {index === 0 && (
                  <button 
                    className="start-test-button"
                    onClick={startTest}
                  >
                    Начать тест
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "questions" && currentQuestion && currentGroup && (
        <div className="question-screen">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${((currentGroupIndex * questions.length + currentQuestionIndex + 1) / 
                  (questionGroups.reduce((acc, group) => acc + group.questions.length, 0)) * 100)}%`
              }}
            ></div>
          </div>
          <div className="progress-text">
            Группа {currentGroupIndex + 1} из {questionGroups.length} • 
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </div>
          <div className="question-content">
            <h3>{currentGroup.name}</h3>
            <h4>{currentQuestion.text}</h4>
            <div className="options">
              {currentQuestion.options.map(option => (
                <button
                  key={`option-${option.id}`}
                  className="option"
                  onClick={() => handleAnswer(option.id)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="result-screen">
          <h2>Рекомендуемые программы</h2>
          <button className="restart-button" onClick={restartTest}>
            Пройти тест снова
          </button>
          <div className="pt-programs">
            {result.recommended_programs.map(program => (
              <div key={`program-${program.id}`} className="pt-program-card">
                <h3>{program.program_name}</h3>
                <div className="pt-program-meta">
                  <span>Уровень: {program.level.name}</span>
                </div>
                <p className="pt-description">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="error-message">
          <p>{error || "Произошла неизвестная ошибка"}</p>
          <button className="retry-button" onClick={restartTest}>
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
};