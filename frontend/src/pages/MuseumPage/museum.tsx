import { useEffect, useState } from 'react';
import axios from 'axios';
import './museum.css';
import { Addaudiences } from './addaudiences';

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

    useEffect(() => {
        const fetchExhibits = async () => {
            try {
                const response = await axios.get('https://tamik327.pythonanywhere.com/api/audiences/');
                
                // Проверка структуры ответа
                if (Array.isArray(response.data)) {
                    setExhibits(response.data);
                } else if (response.data?.results) { // Для пагинации
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

    const filteredExhibits = exhibits.filter(exhibit =>
        exhibit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Загрузка экспонатов...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="museum-container">
            <h1 className="museum-header">Музейные экспонаты</h1>

            <div className="museum-layout">
                <div className="exhibit-list">
                    <input
                        className="search-input"
                        placeholder="Поиск экспонатов..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Addaudiences />

                    <div className="exhibit-grid">
                        {filteredExhibits.map(exhibit => (
                            <div
                                key={exhibit.id}
                                className="exhibit-card"
                                onClick={() => {
                                    setSelectedExhibit(exhibit);
                                    setCurrentImageIndex(0);
                                }}
                            >
                                {exhibit.images[0]?.image && (
                                    <img
                                        src={exhibit.images[0].image}
                                        alt={exhibit.name}
                                        className="exhibit-thumbnail"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                )}
                                <h3 className="exhibit-title">{exhibit.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="exhibit-details">
                    {selectedExhibit ? (
                        <>
                            <div className="image-carousel">
                                {selectedExhibit.images.length > 0 ? (
                                    <>
                                        <div className="carousel-inner">
                                            <img
                                                src={selectedExhibit.images[currentImageIndex].image}
                                                alt={selectedExhibit.images[currentImageIndex].description}
                                                className="main-image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <div className="carousel-controls">
                                                <button
                                                    onClick={handlePrevImage}
                                                    disabled={selectedExhibit.images.length <= 1}
                                                >
                                                    ‹
                                                </button>
                                                <span className="image-counter">
                                                    {currentImageIndex + 1} / {selectedExhibit.images.length}
                                                </span>
                                                <button
                                                    onClick={handleNextImage}
                                                    disabled={selectedExhibit.images.length <= 1}
                                                >
                                                    ›
                                                </button>
                                            </div>
                                        </div>
                                        {selectedExhibit.images[currentImageIndex].description && (
                                            <div className="image-description">
                                                {selectedExhibit.images[currentImageIndex].description}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-images">Изображения отсутствуют</div>
                                )}
                            </div>

                            <div className="exhibit-info">
                                <h2 className="exhibit-name">{selectedExhibit.name}</h2>
                                <p className="exhibit-description">{selectedExhibit.description}</p>

                                {selectedExhibit.characteristics.length > 0 && (
                                    <div className="characteristics">
                                        <h3>Характеристики:</h3>
                                        <dl>
                                            {selectedExhibit.characteristics.map((char, index) => (
                                                <div key={index} className="characteristic">
                                                    <dt>{char.name}:</dt>
                                                    <dd>{char.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="exhibit-placeholder">
                            Выберите экспонат из списка для просмотра подробной информации
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};