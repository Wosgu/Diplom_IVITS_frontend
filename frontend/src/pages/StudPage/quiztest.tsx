import { useState, useEffect } from "react";
import axios from "axios";
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

interface TestSession {
  id: number;
  education_level: string;
  created_at: string;
  completed: boolean;
}

interface Department {
  id: number;
  name: string;
}

interface ProgramFeature {
  id: number;
  title: string;
  description: string;
  program: number;
}

interface Program {
  id: number;
  department: Department;
  level: EducationLevel;
  features: ProgramFeature[];
  career_opportunities: string[];
  code: string;
  name: string;
  program_name: string;
  form: string;
  description: string;
}

interface TestResult {
  id: number;
  recommended_programs: Program[];
  created_at: string;
}

interface Answer {
  question: number;
  answer: number;
}

const api = axios.create({
  baseURL: "https://tamik327.pythonanywhere.com/api/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const QuizComponent = () => {
  const [step, setStep] = useState<"loading" | "level" | "questions" | "result" | "error">("loading");
  const [levels, setLevels] = useState<EducationLevel[]>([]);
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const fetchLevels = async () => {
      try {
        const response = await api.get<EducationLevel[]>("/education-levels/");
        setLevels(response.data);
        setStep("level");
      } catch (error) {
        console.error("Ошибка загрузки уровней:", error);
        setStep("error");
      }
    };

    fetchLevels();
  }, []);

  const handleLevelSelect = async (levelId: number) => {
    try {
      setLoading(true);
      const sessionResponse = await api.post<TestSession>("/start-test/", {
        level_id: levelId,
      });
      setSessionId(sessionResponse.data.id);

      const groupsResponse = await api.get<QuestionGroup[]>("/question-groups/", {
        params: { level_id: levelId },
      });

      const filteredGroups = groupsResponse.data
        .map((group) => ({
          ...group,
          questions: group.questions.filter((q) => q.options.length > 0),
        }))
        .filter((group) => group.questions.length > 0);

      setQuestionGroups(filteredGroups);
      setStep("questions");
    } catch (error) {
      console.error("Ошибка:", error);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionId: number) => {
    const currentQuestion = allQuestions[currentQuestionIndex];
    
    const newAnswer: Answer = {
      question: Number(currentQuestion.id),
      answer: Number(optionId)
    };

    setAnswers((prev) => [...prev, newAnswer]);

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const submitAnswers = async () => {
    if (!sessionId) {
      console.error("Session ID is missing");
      setStep("error");
      return;
    }

    try {
      setLoading(true);
      
      // Отправка ответов
      await api.post(`/sessions/${sessionId}/answers/`, answers);
      
      // Завершение теста
      await api.post(`/sessions/${sessionId}/complete/`);
      
      // Получение результатов
      const resultResponse = await api.get<TestResult>(`/results/${sessionId}/`);
      
      setResult(resultResponse.data);
      setStep("result");
    } catch (error) {
      console.error("Ошибка:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          alert("Сессия не найдена");
        } else if (error.response?.status === 400) {
          alert("Некорректные данные");
        }
      }
      
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const allQuestions = questionGroups
    .flatMap((group) => group.questions)
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {step === "level" && (
        <div className="level-section">
          <h2 className="section-title">Выберите уровень образования</h2>
          <div className="levels-grid">
            {levels.map((level) => (
              <button
                key={level.id}
                className="level-card"
                onClick={() => handleLevelSelect(level.id)}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "questions" && allQuestions.length > 0 && (
        <div className="question-section">
          <div className="progress-counter">
            Вопрос {currentQuestionIndex + 1} из {allQuestions.length}
          </div>
          <h2 className="question-text">{allQuestions[currentQuestionIndex].text}</h2>
          <div className="options-grid">
            {allQuestions[currentQuestionIndex].options.map((option) => (
              <button
                key={option.id}
                className="option-button"
                onClick={() => handleAnswerSelect(option.id)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="result-section">
          <h2 className="section-title">Рекомендуемые программы</h2>
          <div className="programs-list">
            {result.recommended_programs.map((program) => (
              <div key={program.id} className="program-card">
                <h3 className="program-title">{program.program_name}</h3>
                <div className="program-meta">
                  <span className="program-code">{program.code}</span>
                  <span className="program-form">{program.form}</span>
                </div>
                <p className="program-description">{program.description}</p>
                
                <div className="program-department">
                  <h4>Факультет:</h4>
                  <p>{program.department.name}</p>
                </div>

                {program.features.length > 0 && (
                  <div className="program-features">
                    <h4>Особенности программы:</h4>
                    {program.features.map((feature) => (
                      <div key={feature.id} className="feature-item">
                        <strong>{feature.title}</strong>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="career-opportunities">
                  <h4>Карьерные возможности:</h4>
                  <ul>
                    {program.career_opportunities.map((opportunity, idx) => (
                      <li key={idx}>{opportunity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="error-section">
          <h2 className="error-title">Произошла ошибка</h2>
          <p className="error-text">Пожалуйста, попробуйте позже</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </button>
        </div>
      )}
    </div>
  );
};