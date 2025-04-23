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
    const [exhibits, setExhibits] = useState<Exhibit[]>([]);
    const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Запрос данных об экспонатах с бэкенда
    useEffect(() => {
        axios.get('https://tamik327.pythonanywhere.com/api/audiences/')
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
        </>
    );
};