import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
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
    const navigate = useNavigate();
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
            <header className="header">
                <div className="logo">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1>Высшая ИТ-Школа</h1>
                    </Link>
                </div>
                <nav className="nav">
                    <ul>
                        <li><Link to="/about">Сведения об организации</Link></li>
                        <li><Link to="/abitur">Абитуриенту</Link></li>
                        <li><Link to="/stud">Студенту</Link></li>
                        <li><Link to="/lifeinst">Жизнь института</Link></li>
                        <li><Link to="/museum">Музей</Link></li>
                    </ul>
                </nav>
                <button className="login-btn" onClick={() => navigate('/login')}>Войти</button>
            </header>

            <div className="abitur-container">
                <h2 className='priv'>Приветствуем тебя, уважаемый абитуриент!</h2>
                <div className='video-abitur'>
                    <iframe src="https://vk.com/video_ext.php?oid=-225482243&id=456239028&hash=79ad4cf4a97f74c3" 
                            allow="autoplay; encrypted-media" 
                            title="Video"></iframe>
                </div>
                
                <div className='plushki-ifo'>
                    <h1 className='zag-info'>Твой старт в ИТ-индустрии, учись у лучших профессионалов России</h1>
                    <p className='small-info'>Высшая ИТ-школа – новый институт Костромского государственного университета: лучшие преподаватели страны, высокие стипендии, новый учебный корпус, возможность трудоустройства в ИТ-компании после второго курса</p>
                    
                    <div className='plushki'>
                            <div className='plushka'>
                                <img src='/galochka.jpg' alt="Галочка" />
                                <div className='info-plushka'>
                                    <h2 className='zag-plushka'>Лучшие эксперты ИТ-компании из 10 городов России</h2>
                                    <p className='desr-plushka'>Учитесь у лучших, живя в Костроме</p>
                                </div>
                            </div>
                            <div className='plushka'>
                                <img src='/mfti.png' alt="МФТИ" />
                                <div className='info-plushka'>
                                    <h2 className='zag-plushka'>Часть дисциплин ведут преподаватели МФТИ</h2>
                                    <p className='desr-plushka'>Лидирующего технического вуза страны</p>
                                </div>
                            </div>
                            <div className='plushka'>
                                <img src='/rabota.png' alt="Работа" />
                                <div className='info-plushka'>
                                    <h2 className='zag-plushka'>Возможность работы в ИТ после второго курса</h2>
                                    <p className='desr-plushka'>Партнёры программы: Совкомбанк, ММТР, Yandex Cloud, ЮвелирСофт</p>
                                </div>
                            </div>
                            <div className='plushka'>
                                <img src='/format_obucheniya.png' alt="Формат обучения" />
                                <div className='info-plushka'>
                                    <h2 className='zag-plushka'>Нескучный формат обучения</h2>
                                    <p className='desr-plushka'>Много проектов, хакатонов и индивидуальной работы с каждым студентом</p>
                                </div>
                            </div>
                            <div className='plushka'>
                                <img src='/stipendia.png' alt="Стипендия" />
                                <div className='info-plushka'>
                                    <h2 className='zag-plushka'>Единоразовая стипендия до 330 000₽</h2>
                                    <p className='desr-plushka'>Единоразовая стипендия положена: зачисленным на 1 курс с 240+ баллами по ЕГЭ студентам – 100 000₽; за каждый экзамен с результатом в 100 баллов ЕГЭ – по 100 000₽; приехавшим учиться в КГУ из других регионов РФ студентам – 30 000₽</p>
                                </div>
                            </div>
                        </div>
                    </div>

                <button className="toggle-button" onClick={() => setShowTable(!showTable)}>
                    ↓направления подготовки↓
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

            <footer className="footer">
                <div className="footer-content">
                    <div className="social-icons">
                        <a href="https://vk.com" target="_blank" rel="noopener noreferrer"><FaVk size={24} /></a>
                        <a href="https://t.me" target="_blank" rel="noopener noreferrer"><FaTelegram size={24} /></a>
                    </div>
                    <div className="address">
                        <p>Адрес: г. Кострома, ул. Ивановская, д. 24а</p>
                        <p>Политика конфиденциальности</p>
                    </div>
                    <div className="contact-info">
                        <p>156005, Костромская область, городской округ город Кострома, город Кострома, улица Дзержинского, дом 17/11</p>
                        <p>Тел. +7 (4942) 63-49-00 (доб. 1010) (ректорат), +7 (4942) 63-49-00 (доб. 644) (приемная комиссия)</p>
                    </div>
                </div>
            </footer>
        </>
    );
};