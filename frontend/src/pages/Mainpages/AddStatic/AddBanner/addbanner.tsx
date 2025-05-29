import { useState, useRef } from "react";
import "./addbanner.css";

interface AddBannerProps {
  onAddSuccess: () => void;
}

export const AddBanner = ({ onAddSuccess }: AddBannerProps) => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_URL = "https://tamik327.pythonanywhere.com/api/banners/";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError("");

      // Проверка типа файла
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Допустимы только JPG/JPEG/PNG изображения");
      }

      // Проверка размера файла
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Максимальный размер файла - 5MB");
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Требуется авторизация");
      }

      const formData = new FormData();
      formData.append("image", file, file.name);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 
          errorData.image?.[0] || 
          `Ошибка сервера: ${response.status}`
        );
      }

      // Успешная загрузка
      onAddSuccess();
      
      // Сброс значения input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке");
      console.error("Ошибка:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="banner-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
        id="banner-upload-input"
        disabled={isLoading}
        style={{ display: "none" }}
      />
      <label 
        htmlFor="banner-upload-input" 
        className={`banner-upload-button ${isLoading ? "loading" : ""}`}
      >
        {isLoading ? "Загрузка..." : "Добавить баннер"}
      </label>
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};