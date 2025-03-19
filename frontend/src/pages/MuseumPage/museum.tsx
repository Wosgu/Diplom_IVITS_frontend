import { Link, useNavigate } from 'react-router-dom';
import { FaVk, FaTelegram } from "react-icons/fa";
import { useEffect, useState } from 'react';
import axios from 'axios';
import './museum.css';

interface Image {
    audience: number;
    image: string;
    description: string;
}

interface Characteristic {
    audience: number;
    name: string;
    value: string;
}

interface Exhibit {
    id: number;
    name: string;
    description: string;
    images: Image[];
    characteristics: Characteristic[];
}

export const Museum = () => {
    const navigate = useNavigate();
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Запрос данных об экспонатах с бэкенда
    useEffect(() => {
        axios.get('http://26.43.50.46:8000/api/audiences/')
            .then(response => {
                setExhibits(response.data);
            })
            .catch(error => {
                console.error('Ошибка при загрузке экспонатов:', error);
            });
    }, []);

    // Фильтрация экспонатов по поисковому запросу
    const filteredExhibits = exhibits.filter(exhibit =>
        exhibit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            <h1 className='museum-h1'>Музей</h1>
            
            <div className='museum-expo'>
                <div className="museum-list">
                    <input 
                        className="search-bar-input" 
                        placeholder="Поиск..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="exhibits">
                        {filteredExhibits.map(exhibit => (
                            <div 
                                key={exhibit.id} 
                                className="exhibit" 
                                onClick={() => setSelectedExhibit(exhibit)}
                            >
                                {/* Отображение первой фотографии, если она есть */}
                                {exhibit.images.length > 0 && (
                                    <img 
                                        className="exhibit-image" 
                                        src={exhibit.images[0].image} 
                                    />
                                )}
                                <div className="exhibit-name">{exhibit.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="expo-info">
                    <h2 className='h2-expo'>Информация об экспонате</h2>
                    {selectedExhibit ? (
                        <>
                            {selectedExhibit.images.length > 0 && (
                                <img 
                                    className='image-expo' 
                                    src={selectedExhibit.images[0].image} 
                                    alt={selectedExhibit.images[0].description} 
                                />
                            )}
                            <p className='description-expo'>{selectedExhibit.description}</p>
                            {selectedExhibit.characteristics.length > 0 && (
                                <div className="characteristics">
                                    <h3>Характеристики:</h3>
                                    <ul>
                                        {selectedExhibit.characteristics.map((char, index) => (
                                            <li key={index}>
                                                <strong>{char.name}:</strong> {char.value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className='description-expo'>Выберите экспонат для просмотра информации.</p>
                    )}
                </div>
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