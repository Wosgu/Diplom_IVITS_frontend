import { useState, useEffect } from 'react';
import './abitur.css';

// Интерфейс для данных программы
interface Program {
    id: number;
    code: string;
    name: string;
    program_name: string;
    form: string;
    description: string;
    department: {
        id: number;
        name: string;
    };
    level: {
        id: number;
        name: string;
        code: string;
    };
    features: Array<{
        id: number;
        title: string;
        description: string;
        program: number;
    }>;
    career_opportunities: string[];
}

// Интерфейс для ответа API (может быть массивом или объектом с данными)
interface ApiResponse {
    results?: Program[]; // Для пагинации
    programs?: Program[]; // Альтернативное имя
    // Или просто массив программ
}

export const Abitur = () => {
    const [showTable, setShowTable] = useState(false);
    const [data, setData] = useState<Program[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showTable) {
            const fetchData = async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch('https://tamik327.pythonanywhere.com/api/programs/');
                    
                    if (!response.ok) {
                        throw new Error(`Ошибка HTTP! Статус: ${response.status}`);
                    }
                    
                    const result: ApiResponse | Program[] = await response.json();
                    
                    // Обрабатываем разные форматы ответа
                    let programs: Program[] = [];
                    if (Array.isArray(result)) {
                        programs = result;
                    } else if (result.results && Array.isArray(result.results)) {
                        programs = result.results;
                    } else if (result.programs && Array.isArray(result.programs)) {
                        programs = result.programs;
                    }
                    
                    setData(programs);
                } catch (err) {
                    console.error('Ошибка при загрузке данных:', err);
                    setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
                } finally {
                    setLoading(false);
                }
            };
            
            fetchData();
        }
    }, [showTable]);

    return (
        <div className="abitur-container">
            <h2 className='priv'>Приветствуем тебя, уважаемый абитуриент!</h2>
            
            {/* Видео блок */}
            <div className='video-abitur'>
                <iframe 
                    src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" 
                    allow="autoplay; encrypted-media" 
                    title="Видео для абитуриентов"
                ></iframe>
            </div>
            
            {/* Блок преимуществ */}
            <div className="admission-hero">
                <h1 className="hero-title">
                    🚀 Твой старт в ИТ-индустрии<br/>
                    <span>Учись у лучших профессионалов России</span>
                </h1>
                
                <div className="benefits-grid">
                    {/* Карточка со стипендией */}
                    <div className="benefit-card money-pulse">
                        <div className="glow-effect"></div>
                        <img src="/stipendia.png" alt="Стипендия" className="floating-icon"/>
                        <h2>330 000₽</h2>
                        <p>Максимальная стартовая стипендия<br/>за 100 баллов ЕГЭ</p>
                        <div className="sparkles"></div>
                    </div>

                    {/* Карточка про преподавателей */}
                    <div className="benefit-card professor-card tilted">
                        <div className="hologram-effect"></div>
                        <img src="/mfti.png" alt="МФТИ" className="mfti-logo"/>
                        <div className="content">
                            <h3>Преподаватели<br/>МФТИ</h3>
                            <p>Лидер технического образования</p>
                            <div className="science-icons">🧪🔭💻</div>
                        </div>
                    </div>

                    {/* Карточка про трудоустройство */}
                    <div className="benefit-card job-glow">
                        <div className="companies-logos">
                            <img src="/yandex.svg" alt="Yandex"/>
                            <img src="/sovcombank.png" alt="Совкомбанк"/>
                        </div>
                        <h2>Работа после 2 курса</h2>
                        <p>Партнёрские компании:<br/>Yandex, Совкомбанк, ММТР</p>
                        <div className="connection-lines"></div>
                    </div>

                    {/* Карточка про хакатоны */}
                    <div className="benefit-card hackathon-bg">
                        <div className="animated-icons">
                            <div className="icon">🏆</div>
                            <div className="icon">💡</div>
                            <div className="icon">👨💻</div>
                        </div>
                        <h2>Обучение через практику</h2>
                        <ul>
                            <li>Реальные проекты</li>
                            <li>Хакатоны</li>
                            <li>Индивидуальный подход</li>
                        </ul>
                    </div>

                    {/* Карточка про географию */}
                    <div className="benefit-card map-card tilted">
                        <img src="/russia-map.png" alt="Карта России" className="map-image"/>
                        <div className="cities-dots">
                            <span className="dot moscow"></span>
                            <span className="dot spb"></span>
                        </div>
                        <h2>Эксперты из 10 городов</h2>
                        <p>Лучшие специалисты страны в Костроме</p>
                    </div>
                </div>
            </div>

            {/* Кнопка для показа таблицы */}
            <button 
                className={`toggle-button ${showTable ? 'active' : ''}`}
                onClick={() => setShowTable(!showTable)}
            >
                <span>Направления подготовки</span>
                <svg className="arrow" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </button>

            {/* Блок с таблицей */}
            {showTable && (
                <div className="table-container">
                    {loading ? (
                        <div className="loading-message">Загрузка данных...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Код направления</th>
                                    <th>Название программы</th>
                                    <th>Уровень образования</th>
                                    <th>Форма обучения</th>
                                    <th>Описание</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.code}</td>
                                            <td>{item.program_name}</td>
                                            <td>{item.level.name}</td>
                                            <td>{item.form}</td>
                                            <td>{item.description}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{textAlign: 'center'}}>
                                            Нет данных для отображения
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};