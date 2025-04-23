import { useState, useEffect } from 'react';
import './abitur.css';

// Новый интерфейс для данных программ
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

export const Abitur = () => {
    const [showTable, setShowTable] = useState(false);
    const [data, setData] = useState<Program[]>([]);

    useEffect(() => {
        if (showTable) {
            fetch('https://tamik327.pythonanywhere.com/api/programs/')
                .then(response => response.json())
                .then((data: Program[]) => setData(data))
                .catch(error => console.error('Ошибка при загрузке данных:', error));
        }
    }, [showTable]);

    return (
        <>
            <div className="abitur-container">
                <h2 className='priv'>Приветствуем тебя, уважаемый абитуриент!</h2>
                <div className='video-abitur'>
                    <iframe src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" 
                            allow="autoplay; encrypted-media" 
                            title="Video"></iframe>
                </div>
                
                <div className="admission-hero">
                    <h1 className="hero-title">🚀 Твой старт в ИТ-индустрии<br/><span>Учись у лучших профессионалов России</span></h1>
                    
                    <div className="benefits-grid">

                        <div className="benefit-card money-pulse">
                            <div className="glow-effect"></div>
                            <img src="/stipendia.png" alt="Иконка" className="floating-icon"/>
                            <h2>330 000₽</h2>
                            <p>Максимальная стартовая стипендия<br/>за 100 баллов ЕГЭ</p>
                            <div className="sparkles"></div>
                        </div>


                        <div className="benefit-card professor-card tilted">
                            <div className="hologram-effect"></div>
                            <img src="/mfti.png" alt="МФТИ" className="mfti-logo"/>
                            <div className="content">
                                <h3>Преподаватели<br/>МФТИ</h3>
                                <p>Лидер технического образования</p>
                                <div className="science-icons">🧪🔭💻</div>
                            </div>
                        </div>

                        <div className="benefit-card job-glow">
                            <div className="companies-logos">
                                <img src="/yandex-cloud.png" alt="Yandex"/>
                                <img src="/sovcombank.png" alt="Совкомбанк"/>
                            </div>
                            <h2>Работа после 2 курса</h2>
                            <p>Партнёрские компании:<br/>Yandex Cloud, Совкомбанк, ММТР</p>
                            <div className="connection-lines"></div>
                        </div>


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


                        <div className="benefit-card map-card tilted">
                            <img src="/russia-map.png" alt="Карта" className="map-image"/>
                            <div className="cities-dots">
                                <span className="dot moscow"></span>
                                <span className="dot spb"></span>

                            </div>
                            <h2>Эксперты из 10 городов</h2>
                            <p>Лучшие специалисты страны в Костроме</p>
                        </div>
                    </div>
                </div>

                <button 
                    className={`toggle-button ${showTable ? 'active' : ''}`}
                    onClick={() => setShowTable(!showTable)}
                    >
                    <span>Направления подготовки</span>
                    <svg className="arrow" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                    </button>

                    {showTable && (
                    <div className="table-container">
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
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.code}</td>
                                        <td>{item.program_name}</td>
                                        <td>{item.level.name}</td>
                                        <td>{item.form}</td>
                                        <td>{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};