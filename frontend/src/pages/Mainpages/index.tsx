import { useState, useEffect, useRef } from "react";
import "./index.css";
import { News } from "./news";
import { Program } from "./program";
import { Achievement } from "../Mainpages/Achievement/achievement";
import { Reviews } from "./Reviews/reviews";
import { Assistant } from "../Assistant/assistant";
import { Banner } from "./Banner/banner";
import { QuizComponent } from "../StudPage/quiztest";
import { EventCalendar } from "../StudPage/eventcalendar";

interface Video {
  id: number;
  title: string;
  file: string;
  description: string;
}

export const MainPage = () => {
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [error] = useState("");
  const [videoError, setVideoError] = useState("");
  const [poster, setPoster] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const VIDEO_API = "https://vits44.ru/api/videos/1/";

  const fetchVideo = async () => {
    try {
      setVideoLoading(true);
      setVideoError("");

      const response = await fetch(VIDEO_API);

      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }

      const data: Video = await response.json();
      setVideoData(data);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Ошибка загрузки видео");
      console.error("Ошибка загрузки видео:", err);
    } finally {
      setVideoLoading(false);
    }
  };

  const generatePoster = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPoster(canvas.toDataURL("image/jpeg"));
    }
  };

  useEffect(() => {
    fetchVideo();
  }, []);

  useEffect(() => {
    if (videoData?.file && !poster) {
      const tempVideo = document.createElement("video");
      tempVideo.crossOrigin = "anonymous";
      tempVideo.src = videoData.file;

      tempVideo.onloadedmetadata = () => {
        // Устанавливаем время для захвата кадра (1 секунда)
        tempVideo.currentTime = Math.min(1, tempVideo.duration / 2);
      };

      tempVideo.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = tempVideo.videoWidth;
        canvas.height = tempVideo.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          setPoster(canvas.toDataURL("image/jpeg"));
        }
      };

      tempVideo.onerror = () => {
        console.error("Ошибка загрузки видео для генерации превью");
      };
    }
  }, [videoData, poster]);

  if (error) return <div className="error">Ошибка: {error}</div>;

  return (
    <>
      <Banner />
      <div className="main-index">
        <div className="index-info">
          <div className="rolikvits">
            {videoLoading ? (
              <div className="loading">Загрузка видео...</div>
            ) : videoError ? (
              <div className="error">Ошибка загрузки видео: {videoError}</div>
            ) : videoData ? (
              <>
                {/* Скрытое видео для генерации превью */}
                <video
                  ref={videoRef}
                  style={{ display: "none" }}
                  src={videoData.file}
                  onLoadedMetadata={generatePoster}
                  crossOrigin="anonymous"
                />
                {/* Основное видео с превью */}
                <video
                  controls
                  width="100%"
                  height="auto"
                  title={videoData.title}
                  poster={poster || undefined}
                  crossOrigin="anonymous"
                >
                  <source src={videoData.file} type="video/mp4" />
                  Ваш браузер не поддерживает видео тег.
                </video>
              </>
            ) : (
              <div className="error">Видео не найдено</div>
            )}
          </div>
        </div>
        <News />
        <h3 className="programm-h">Профориентационное тестирование для Абитуриентов</h3>
        <QuizComponent />
        <Program />
        <Achievement />
        <Reviews />
        <EventCalendar />
        <Assistant />
      </div>
    </>
  );
};