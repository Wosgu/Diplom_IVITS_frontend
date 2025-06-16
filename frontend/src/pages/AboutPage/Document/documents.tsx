import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useAuth, ApiEndpointHelper } from '../../../Context/AuthContext';
import './documents.css';

Modal.setAppElement('#root');

interface Document {
  id: number;
  title: string;
  file_url: string;
  created_at?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];
const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

export const Documents = () => {
  const { userData, getAuthHeader } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    file: null as File | null,
    fileError: ''
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Для неавторизованных пользователей не передаем заголовки авторизации
        const headers = userData ? (await getAuthHeader()).headers : {};
        const response = await axios.get(ApiEndpointHelper.documents(), { headers });
        
        if (response.data && response.data.results) {
          const validDocs = response.data.results.filter((doc: any) => 
            doc && 
            typeof doc.id === 'number' && 
            typeof doc.title === 'string' && 
            typeof doc.file_url === 'string'
          ).map((doc: any) => ({
            ...doc,
            created_at: doc.created_at || new Date().toISOString()
          }));
          setDocuments(validDocs);
        } else {
          throw new Error('Неверный формат ответа сервера');
        }
      } catch (err) {
        console.error('Ошибка загрузки документов:', err);
        setError('Не удалось загрузить документы. Пожалуйста, попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [userData]); // Добавляем userData в зависимости, чтобы обновлять список при изменении авторизации

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      let error = '';

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        error = `Недопустимый формат файла. Разрешенные форматы: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        error = `Файл слишком большой. Максимальный размер: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      }

      setNewDocument({
        ...newDocument,
        file: error ? null : file,
        fileError: error
      });

      if (error) {
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDocument.title.trim()) {
      alert('Пожалуйста, введите название документа');
      return;
    }

    if (!newDocument.file) {
      alert('Пожалуйста, выберите файл');
      return;
    }

    const formData = new FormData();
    formData.append('title', newDocument.title.trim());
    formData.append('file', newDocument.file);

    setIsUploading(true);
    try {
      const response = await axios.post(
        ApiEndpointHelper.documents(),
        formData,
        {
          headers: {
            ...(await getAuthHeader()).headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.id && response.data.file_url) {
        setDocuments([{
          ...response.data,
          created_at: new Date().toISOString()
        }, ...documents]);
        setIsModalOpen(false);
        setNewDocument({ title: '', file: null, fileError: '' });
      } else {
        throw new Error('Неверный формат ответа сервера');
      }
    } catch (err: any) {
      console.error('Ошибка загрузки документа:', err);
      
      let errorMessage = 'Ошибка при добавлении документа';
      if (err.response) {
        if (err.response.data) {
          errorMessage = Object.values(err.response.data).flat().join('\n');
        } else {
          errorMessage = `Ошибка сервера: ${err.response.status}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (isLoading) {
    return (
      <div className="documents-container">
        <div className="documents-loading">
          <div className="spinner"></div>
          <p>Загрузка документов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-container">
        <div className="documents-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>Документы института</h1>
        {userData && ApiEndpointHelper.isAdmin(userData) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="add-document-button"
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Добавить документ'}
          </button>
        )}
      </div>

      {documents.length > 0 ? (
        <div className="table-responsive">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Название документа</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="document-title">{doc.title}</div>
                    <div className="document-meta">
                      Добавлен: {formatDate(doc.created_at || new Date().toISOString())}
                    </div>
                  </td>
                  <td>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-pdf-link"
                    >
                      Открыть
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-documents">
          <p>Нет доступных документов</p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => !isUploading && setIsModalOpen(false)}
        className="document-modal"
        overlayClassName="document-modal-overlay"
      >
        <h2>Добавить новый документ</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название документа*</label>
            <input
              type="text"
              value={newDocument.title}
              onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
              required
              disabled={isUploading}
              placeholder="Введите название документа"
            />
          </div>
          
          <div className="form-group">
            <label>Файл документа*</label>
            <input
              type="file"
              onChange={handleFileChange}
              required
              disabled={isUploading}
              accept={ALLOWED_FILE_EXTENSIONS.join(',')}
            />
            {newDocument.fileError && (
              <div className="file-error">{newDocument.fileError}</div>
            )}
            <div className="file-hint">
              Допустимые форматы: {ALLOWED_FILE_EXTENSIONS.join(', ')}<br />
              Максимальный размер: 5MB
            </div>
          </div>
          
          <div className="modal-buttons">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isUploading}
              className="cancel-button"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!newDocument.title || !newDocument.file || isUploading}
              className="submit-button"
            >
              {isUploading ? 'Отправка...' : 'Добавить'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};