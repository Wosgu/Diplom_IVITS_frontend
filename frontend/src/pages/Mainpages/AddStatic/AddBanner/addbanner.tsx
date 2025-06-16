import { useState, useRef } from "react";
import "./addbanner.css";
import { ApiEndpointHelper } from "../../../../Context/AuthContext"; 
import { useAuth } from "../../../../Context/AuthContext"; 
import Cookies from 'js-cookie';
import axios from "axios";

interface AddBannerProps {
  onAddSuccess: () => void;
}

export const AddBanner = ({ onAddSuccess }: AddBannerProps) => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

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

      if (!isAuthenticated) {
        throw new Error("Требуется авторизация");
      }

      const token = Cookies.get('access_token');
      if (!token) {
        throw new Error("Требуется авторизация");
      }

      const formData = new FormData();
      formData.append("image", file, file.name);

      await axios.post(ApiEndpointHelper.banners(), formData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      // Успешная загрузка
      onAddSuccess();
      
      // Сброс значения input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Обработка ошибок axios
        const errorData = err.response?.data;
        setError(
          errorData?.detail || 
          errorData?.image?.[0] || 
          err.message ||
          "Ошибка при загрузке файла"
        );
      } else {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      }
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