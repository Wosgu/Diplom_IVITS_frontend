import { useState, useEffect, useRef } from 'react';
import './abitur.css';
import axios from 'axios';
import { ApiEndpointHelper } from '../../Context/AuthContext';
import { EventCalendar } from '../StudPage/eventcalendar';
import { Assistant } from '../Assistant/assistant';

interface Program {
    id: number;
    code: string;
    program_name: string;
    department: string;
    level: string;
    form_display: string;
    is_active: boolean;
}

interface ApiResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Program[];
}

interface VideoData {
    id: number;
    title: string;
    file: string;
    description: string;
}

export const Abitur = () => {
    const [showPrograms, setShowPrograms] = useState(false);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoData, setVideoData] = useState<VideoData | null>(null);
    const [videoLoading, setVideoLoading] = useState(true);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isAnimating, setIsAnimating] = useState(false);
    const [videoPoster, setVideoPoster] = useState<string | null>(null);
    const programsContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const generateVideoPoster = async (videoUrl: string) => {
        return new Promise<string>((resolve, reject) => {
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = videoUrl;

            video.onloadedmetadata = () => {
                // Устанавливаем время для захвата кадра (1 секунда или середина видео)
                video.currentTime = Math.min(1, video.duration / 2);
            };

            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');

                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg'));
                } else {
                    reject('Не удалось получить контекст Canvas');
                }
            };

            video.onerror = () => {
                reject('Ошибка загрузки видео для генерации превью');
            };
        });
    };

    useEffect(() => {
        const fetchVideo = async () => {
            setVideoLoading(true);
            setVideoError(null);
            try {
                const response = await axios.get<VideoData>('https://vits44.ru/api/videos/1/');
                setVideoData(response.data);

                // Генерируем превью только если нет стандартного постера
                if (!response.data.file.includes('poster.jpg')) {
                    try {
                        const poster = await generateVideoPoster(response.data.file);
                        setVideoPoster(poster);
                    } catch (err) {
                        console.warn('Не удалось сгенерировать превью:', err);
                    }
                }
            } catch (err) {
                console.error('Ошибка при загрузке видео:', err);
                setVideoError('Не удалось загрузить видео');
            } finally {
                setVideoLoading(false);
            }
        };
        fetchVideo();
    }, []);

    const togglePrograms = async () => {
        if (isAnimating) return;

        if (!showPrograms && programs.length === 0) {
            setLoading(true);
            try {
                const response = await axios.get<ApiResponse>(ApiEndpointHelper.programs(), {
                    withCredentials: true
                });
                setPrograms(response.data.results);
                setShowPrograms(true);
                setIsAnimating(true);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        } else {
            setIsAnimating(true);
            setShowPrograms(!showPrograms);
        }
    };

    const handleTransitionEnd = () => {
        setIsAnimating(false);
    };

    const renderDesktopTable = () => (
        <table className="programs-table">
            <thead>
                <tr>
                    <th>Код</th>
                    <th>Программа</th>
                    <th>Кафедра</th>
                    <th>Уровень</th>
                    <th>Форма обучения</th>
                </tr>
            </thead>
            <tbody>
                {programs.map((program, index) => (
                    <tr
                        key={program.id}
                        style={{ transitionDelay: `${index * 0.05}s` }}
                    >
                        <td>{program.code}</td>
                        <td className="program-name">{program.program_name}</td>
                        <td>{program.department}</td>
                        <td>{program.level}</td>
                        <td>{program.form_display}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMobileCards = () => (
        <div className="programs-cards">
            {programs.map((program, index) => (
                <div
                    key={program.id}
                    className="program-card"
                    style={{ transitionDelay: `${index * 0.05}s` }}
                >
                    <div className="card-header">
                        <span className="program-code">{program.code}</span>
                        <h3 className="program-name">{program.program_name}</h3>
                    </div>
                    <div className="card-details">
                        <div className="detail-row">
                            <span className="detail-label">Кафедра:</span>
                            <span>{program.department}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Уровень:</span>
                            <span>{program.level}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Форма обучения:</span>
                            <span>{program.form_display}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="abitur-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Приветствуем тебя, уважаемый абитуриент!</h1>
                    <p className="hero-subtitle">Выбери своё будущее в IT вместе с нами</p>
                </div>

                {/* Video Section */}
                <div className="video-container">
                    <div className="video-abitur">
                        {videoLoading ? (
                            <div className="video-loading">
                                <div className="spinner"></div>
                                <span>Загрузка видео...</span>
                            </div>
                        ) : videoError ? (
                            <div className="video-error">
                                <span className="error-icon">⚠️</span>
                                {videoError}
                            </div>
                        ) : videoData ? (
                            <>
                                {/* Скрытое видео для генерации превью */}
                                <video
                                    ref={videoRef}
                                    style={{ display: 'none' }}
                                    src={videoData.file}
                                    crossOrigin="anonymous"
                                />
                                {/* Основное видео с превью */}
                                <video
                                    controls
                                    className="video-player"
                                    poster={videoPoster || "https://storage.yandexcloud.net/vits/media/organization_documents/poster.jpg"}
                                >
                                    <source src={videoData.file} type="video/mp4" />
                                    Ваш браузер не поддерживает видео
                                </video>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className="hero-gradient"></div>
            </div>

            {/* Benefits Section */}
            <div className="benefits-section">
                <div className="section-header">
                    <h2>Твой старт в ИТ-индустрии</h2>
                    <div className="professionals-text">
                        <span>Учись у лучших профессионалов России</span>
                    </div>
                </div>

                <div className="benefits-grid">
                    {/* Card 1 */}
                    <div className="benefit-card card-blue">
                        <div className="card-icon">💰</div>
                        <h3>Киберспортивная стипендия</h3>
                        <p>Дополнительная стипендия за успехи в киберспортивных турнирах!</p>
                        <div className="card-decoration"></div>
                    </div>

                    {/* Card 2 */}
                    <div className="benefit-card card-purple">
                        <div className="card-icon">👨‍🏫</div>
                        <h3>Преподаватели МФТИ</h3>
                        <p>Обучение у лучших специалистов страны</p>
                        <div className="card-decoration"></div>
                    </div>

                    {/* Card 3 */}
                    <div className="benefit-card card-green">
                        <div className="card-icon">💼</div>
                        <h3>Работа после 2 курса</h3>
                        <p>Партнёры: Yandex, Совкомбанк, ММТР</p>
                        <div className="card-decoration"></div>
                    </div>

                    {/* Card 4 */}
                    <div className="benefit-card card-orange">
                        <div className="card-icon">👨‍💻</div>
                        <h3>Обучение через практику</h3>
                        <p>Реальные проекты и хакатоны</p>
                        <div className="card-decoration"></div>
                    </div>
                </div>
            </div>

            {/* Programs Toggle */}
            <div className="toggle-section">
                <button
                    className={`toggle-button ${showPrograms ? 'active' : ''}`}
                    onClick={togglePrograms}
                    disabled={loading || isAnimating}
                >
                    <span>Направления подготовки ({programs.length})</span>
                    {loading ? (
                        <div className="button-spinner"></div>
                    ) : (
                        <svg className="arrow" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M7 10l5 5 5-5z" fill="currentColor" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Programs Display */}
            <div
                className={`programs-container ${showPrograms ? 'show' : ''}`}
                ref={programsContainerRef}
                onTransitionEnd={handleTransitionEnd}
            >
                {showPrograms && (
                    <>
                        {error ? (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        ) : programs.length > 0 ? (
                            isMobile ? renderMobileCards() : renderDesktopTable()
                        ) : (
                            <div className="no-data">
                                Нет данных для отображения
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <h3>Готов начать своё IT-будущее?</h3>
                <p>Оставь заявку на консультацию и мы поможем с выбором программы</p>
                <button className="cta-button">Оставить заявку</button>
            </div>
            <EventCalendar />
            <Assistant />
        </div>
    );
};