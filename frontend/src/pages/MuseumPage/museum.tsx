import { useEffect, useState } from 'react';
import axios from 'axios';
import './museum.css';
import { Addaudiences } from './addaudiences';
import { ApiEndpointHelper, useAuth } from '../../Context/AuthContext';

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
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const { userData } = useAuth();
    const isAdmin = ApiEndpointHelper.isAdmin(userData);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchExhibits = async () => {
            try {
                const response = await axios.get(ApiEndpointHelper.audiences(), {
                    withCredentials: true
                });
                
                if (Array.isArray(response.data)) {
                    setExhibits(response.data);
                } else if (response.data?.results) {
                    setExhibits(response.data.results);
                } else {
                    throw new Error('Некорректный формат данных от сервера');
                }
            } catch (err) {
                console.error('Ошибка при загрузке экспонатов:', err);
                setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
            } finally {
                setLoading(false);
            }
        };

        fetchExhibits();
    }, []);

    const handleNextImage = () => {
        if (selectedExhibit) {
            setCurrentImageIndex(prev =>
                (prev + 1) % selectedExhibit.images.length
            );
        }
    };

    const handlePrevImage = () => {
        if (selectedExhibit) {
            setCurrentImageIndex(prev =>
                (prev - 1 + selectedExhibit.images.length) % selectedExhibit.images.length
            );
        }
    };

    const handleExhibitSelect = (exhibit: Exhibit) => {
        setSelectedExhibit(exhibit);
        setCurrentImageIndex(0);
        if (isMobile) setSidebarOpen(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const filteredExhibits = exhibits.filter(exhibit =>
        exhibit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Загрузка экспонатов...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-screen">
                <div className="error-icon">⚠️</div>
                <h2>Ошибка</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Попробовать снова</button>
            </div>
        );
    }

    return (
        <div className={`museum-app ${isMobile ? 'mobile-view' : ''}`}>
            <div className="app-header">
                {isMobile && (
                    <button 
                        className="burger-button"
                        onClick={toggleSidebar}
                        aria-label="Меню"
                    >
                        ☰
                    </button>
                )}
                <h1>Музейная коллекция</h1>
            </div>

            <div className="app-container">
                <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Поиск экспонатов..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {isAdmin && <Addaudiences />}

                    <div className="exhibit-list">
                        {filteredExhibits.length > 0 ? (
                            filteredExhibits.map(exhibit => (
                                <div
                                    key={exhibit.id}
                                    className={`exhibit-card ${selectedExhibit?.id === exhibit.id ? 'active' : ''}`}
                                    onClick={() => handleExhibitSelect(exhibit)}
                                >
                                    <div className="card-header">
                                        <span className="card-icon">📁</span>
                                        <h3 className="card-title">{exhibit.name}</h3>
                                    </div>
                                    {exhibit.images[0]?.image && (
                                        <div className="card-thumbnail">
                                            <img
                                                src={exhibit.images[0].image}
                                                alt={exhibit.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Ничего не найдено</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="main-content">
                    {selectedExhibit ? (
                        <div className="exhibit-viewer">
                            {isMobile && (
                                <button 
                                    className="back-button"
                                    onClick={toggleSidebar}
                                >
                                    ← Назад к списку
                                </button>
                            )}

                            <div className="viewer-header">
                                <h2>{selectedExhibit.name}</h2>
                                <div className="breadcrumbs">
                                    <span>Музей</span> &gt; <span>Коллекция</span> &gt; <span>{selectedExhibit.name}</span>
                                </div>
                            </div>

                            <div className="image-viewer">
                                {selectedExhibit.images.length > 0 ? (
                                    <>
                                        <div className="image-container">
                                            <img
                                                src={selectedExhibit.images[currentImageIndex].image}
                                                alt={selectedExhibit.images[currentImageIndex].description}
                                                className="main-image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = 
                                                        '<div class="image-error">Изображение недоступно</div>';
                                                }}
                                            />
                                            <div className="image-nav">
                                                <button 
                                                    onClick={handlePrevImage} 
                                                    disabled={selectedExhibit.images.length <= 1}
                                                    aria-label="Предыдущее изображение"
                                                >
                                                    ◄
                                                </button>
                                                <span className="image-counter">
                                                    {currentImageIndex + 1} из {selectedExhibit.images.length}
                                                </span>
                                                <button 
                                                    onClick={handleNextImage} 
                                                    disabled={selectedExhibit.images.length <= 1}
                                                    aria-label="Следующее изображение"
                                                >
                                                    ►
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="no-images">
                                        <div className="no-images-icon">🖼️</div>
                                        <p>Нет изображений для этого экспоната</p>
                                    </div>
                                )}
                            </div>

                            <div className="exhibit-details">
                                <div className="details-section">
                                    <h3 className="section-title">Описание</h3>
                                    <p className="section-content">
                                        {selectedExhibit.description || "Описание отсутствует"}
                                    </p>
                                </div>

                                {selectedExhibit.characteristics.length > 0 && (
                                    <div className="details-section">
                                        <h3 className="section-title">Характеристики</h3>
                                        <div className="characteristics-grid">
                                            {selectedExhibit.characteristics.map((char, index) => (
                                                <div key={index} className="characteristic-row">
                                                    <span className="char-name">{char.name}:</span>
                                                    <span className="char-value">{char.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="welcome-screen">
                            <div className="welcome-icon">🏛️</div>
                            <h2>Музейная коллекция</h2>
                            <p>Выберите экспонат из списка для просмотра подробной информации</p>
                            {isMobile && !sidebarOpen && (
                                <button 
                                    className="show-menu-button"
                                    onClick={toggleSidebar}
                                >
                                    Показать меню
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="status-bar">
                <div className="status-item">
                    <span>Экспонатов:</span> {exhibits.length}
                </div>
                <div className="status-item">
                    <span>Найдено:</span> {filteredExhibits.length}
                </div>
                <div className="status-item">
                    <span>Выбрано:</span> {selectedExhibit ? selectedExhibit.name : 'Нет'}
                </div>
            </div>
        </div>
    );
};