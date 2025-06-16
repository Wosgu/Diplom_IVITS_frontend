import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaRegThumbsUp, FaRegComment, FaThumbsUp, FaEllipsisH, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import axios from 'axios';
import { Addnews } from "./addnews";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ApiEndpointHelper, useAuth } from '../../Context/AuthContext';
import './lifeinst.css';
import { EventCalendar } from "../StudPage/eventcalendar";
import { Assistant } from "../Assistant/assistant";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  images: Array<{
    id: number;
    image: string;
  }>;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  author: {
    id: number;
    username: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    description: string;
  } | null;
  tags: Array<{
    id: number;
    name: string;
  }>;
  comments_count: number;
  likes_count: number;
  liked_by_user: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Comment {
  id: number;
  text: string;
  created_at: string;
  news: number;
  author: {
    username: string;
    avatar?: string;
  };
}

const CommentItem = React.memo(({ comment }: { comment: Comment }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      className="comment"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <img
        src={comment.author.avatar || '/default_avatar.jpg'}
        alt="Аватар"
        className="comment-avatar"
      />
      <div className="comment-content">
        <div className="comment-header">
          <span className="username">{comment.author.username}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </motion.div>
  );
});

interface NewsItemProps {
  item: NewsItem;
  onLike: (id: number) => void;
  onCommentSubmit: (id: number, text: string) => Promise<void>;
  onToggleComments: (id: number) => void;
  onImageSwap: (id: number, index: number) => void;
  onImageClick: (url: string) => void;
  comments: Comment[];
  showComments: boolean;
  loadingComments: boolean;
}

const NewsItem: React.FC<NewsItemProps> = React.memo(({
  item,
  onLike,
  onCommentSubmit,
  onToggleComments,
  onImageSwap,
  onImageClick,
  comments,
  showComments,
  loadingComments
}) => {
  const [expanded, setExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const shouldShowCommentsToggle = item.comments_count > 1;
  const shouldShowExpandButton = item.content.length > 30;

  const handleCommentSubmit = async () => {
    if (newCommentText.trim()) {
      try {
        await onCommentSubmit(item.id, newCommentText);
        setNewCommentText('');
      } catch (error) {
        console.error('Ошибка при отправке комментария:', error);
      }
    }
  };

  const handleImageSwap = (index: number) => {
    setCurrentImageIndex(index);
    onImageSwap(item.id, index);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryName = (category: { id: number; name: string } | null) => {
    return category ? category.name : 'Без категории';
  };

  const renderImageCollage = () => {
    if (item.images.length === 0) {
      return (
        <motion.img
          src="/default_news.jpg"
          alt="Заглушка"
          className="single-image"
          whileHover={{ scale: 1.02 }}
          onClick={() => onImageClick("/default_news.jpg")}
        />
      );
    }

    const mainImage = item.images[currentImageIndex];
    const sideImages = item.images.filter((_, index) => index !== currentImageIndex);

    return (
      <div className="image-collage">
        <motion.div className="main-image-container" whileHover={{ scale: 1.01 }}>
          <img
            src={mainImage.image}
            alt={`Main-${mainImage.id}`}
            className="main-image"
            onClick={() => onImageClick(mainImage.image)}
          />
        </motion.div>
        {sideImages.length > 0 && (
          <div className="side-images">
            {sideImages.map((image) => {
              const originalIndex = item.images.findIndex(img => img.id === image.id);
              return (
                <motion.div
                  key={image.id}
                  className="side-image-container"
                  onClick={() => handleImageSwap(originalIndex)}
                  whileHover={{ scale: 0.98 }}
                >
                  <img
                    src={image.image}
                    alt={`Side-${image.id}`}
                    className="side-image"
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      ref={ref}
      className='novost-item'
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {renderImageCollage()}

      <div className="novost-item-content-wrapper">
        <div className="title-date">
          <h3>{item.title}</h3>
          <p className="publish-date">{formatDate(item.created_at)}</p>
          <p className="author">Автор: {item.author.username}</p>
        </div>

        <div className="tags">
          {item.category && (
            <span className="tag category-tag">
              {getCategoryName(item.category)}
            </span>
          )}
          {item.tags.map((tag) => (
            <span key={tag.id} className="tag">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="novost-item-content">
          <p>
            {expanded ? item.content : `${item.content.slice(0, 200)}${shouldShowExpandButton ? '...' : ''}`}
          </p>
          {shouldShowExpandButton && (
            <button className="expand-button" onClick={toggleExpand}>
              {expanded ? (
                <>
                  <span>Свернуть</span>
                  <FaChevronUp className="expand-icon" />
                </>
              ) : (
                <>
                  <span>Развернуть</span>
                  <FaChevronDown className="expand-icon" />
                </>
              )}
            </button>
          )}
        </div>

        <div className="interactions">
          <button
            className={`interaction-item ${item.liked_by_user ? 'liked' : ''}`}
            onClick={() => onLike(item.id)}
          >
            {item.liked_by_user ? <FaThumbsUp /> : <FaRegThumbsUp />}
            <span>{item.likes_count}</span>
          </button>
          <button
            className="interaction-item"
            onClick={() => {
              onToggleComments(item.id);
              commentInputRef.current?.focus();
            }}
          >
            <FaRegComment />
            <span>{item.comments_count}</span>
          </button>
        </div>

        <div className="comments-section" id={`comments-${item.id}`}>
          <div className={`comments-container ${showComments ? 'expanded' : ''}`}>
            {loadingComments ? (
              <div className="comments-loading">Загрузка комментариев...</div>
            ) : showComments ? (
              comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            ) : comments.length > 0 ? (
              <CommentItem comment={comments[comments.length - 1]} />
            ) : null}
          </div>

          {shouldShowCommentsToggle && (
            <button
              className="toggle-comments-btn"
              onClick={() => onToggleComments(item.id)}
              disabled={loadingComments}
            >
              {showComments
                ? 'Скрыть комментарии'
                : `Показать все комментарии (${item.comments_count})`}
              <FaEllipsisH className="toggle-icon" />
            </button>
          )}

          <div className="comment-form">
            <textarea
              ref={commentInputRef}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Оставьте комментарий..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
            />
            <button
              onClick={handleCommentSubmit}
              className="submit-comment-btn"
              disabled={!newCommentText.trim()}
            >
              <FiSend className="send-icon" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export const Lifeinst = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddNews, setShowAddNews] = useState(false);
  const [imageModal, setImageModal] = useState({ visible: false, url: '' });
  const [commentsMap, setCommentsMap] = useState<{ [key: number]: Comment[] }>({});
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
  const { isAuthenticated, userData, getAuthHeader } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      const config = {
        withCredentials: true
      };

      const [newsResponse, categoriesResponse] = await Promise.all([
        axios.get<{ results: NewsItem[] }>(ApiEndpointHelper.news(), config),
        axios.get<{ results: Category[] }>(ApiEndpointHelper.categories(), config)
      ]);

      setNews(newsResponse.data.results);
      setCategories(categoriesResponse.data.results);

      const initialExpandedComments = newsResponse.data.results.reduce((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {} as { [key: number]: boolean });
      setExpandedComments(initialExpandedComments);

      const initialLoadingComments = newsResponse.data.results.reduce((acc, item) => {
        acc[item.id] = false;
        return acc;
      }, {} as { [key: number]: boolean });
      setLoadingComments(initialLoadingComments);

    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      setError("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCategoryToggle = useCallback((categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleLike = useCallback(async (newsId: number) => {
    if (!isAuthenticated) {
      alert('Для оценки новости необходимо авторизоваться!');
      return;
    }

    try {
      const newsItem = news.find(item => item.id === newsId);
      if (!newsItem) return;

      const config = {
        ...(await getAuthHeader()),
        withCredentials: true
      };

      if (newsItem.liked_by_user) {
        await axios.delete(
          ApiEndpointHelper.likes().replace('${newsId}', newsId.toString()),
          config
        );
        setNews(prev => prev.map(item =>
          item.id === newsId
            ? { ...item, likes_count: item.likes_count - 1, liked_by_user: false }
            : item
        ));
      } else {
        await axios.post(
          ApiEndpointHelper.likes().replace('${newsId}', newsId.toString()),
          {},
          config
        );
        setNews(prev => prev.map(item =>
          item.id === newsId
            ? { ...item, likes_count: item.likes_count + 1, liked_by_user: true }
            : item
        ));
      }
    } catch (error) {
      console.error('Ошибка при обработке лайка:', error);
    }
  }, [news, isAuthenticated, getAuthHeader]);

  const handleCommentSubmit = useCallback(async (newsId: number, text: string): Promise<void> => {
    if (!isAuthenticated) {
      alert('Для добавления комментария необходимо авторизоваться!');
      return;
    }

    try {
      const authHeader = await getAuthHeader();
      const config = {
        ...authHeader,
        withCredentials: true
      };

      await axios.post(
        ApiEndpointHelper.comments(),
        { news: newsId, text },
        config
      );

      setNews(prev => prev.map(item =>
        item.id === newsId
          ? { ...item, comments_count: item.comments_count + 1 }
          : item
      ));

      const commentsResponse = await axios.get<{ results: Comment[] }>(
        ApiEndpointHelper.commentsnews().replace('${newsId}', newsId.toString()),
        config
      );

      setCommentsMap(prev => ({
        ...prev,
        [newsId]: commentsResponse.data.results
      }));
    } catch (error) {
      console.error('Ошибка отправки комментария:', error);
      throw error;
    }
  }, [isAuthenticated, getAuthHeader]);

  const handleToggleComments = useCallback(async (newsId: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [newsId]: !prev[newsId]
    }));

    if (!commentsMap[newsId] && expandedComments[newsId] === false) {
      try {
        setLoadingComments(prev => ({ ...prev, [newsId]: true }));

        const config = isAuthenticated
          ? { 
              ...(await getAuthHeader()), 
              withCredentials: true
            }
          : { withCredentials: true };

        const response = await axios.get<{ results: Comment[] }>(
          ApiEndpointHelper.commentsnews().replace('${newsId}', newsId.toString()),
          config
        );

        setCommentsMap(prev => ({
          ...prev,
          [newsId]: response.data.results
        }));
      } catch (error) {
        console.error(`Error loading comments for news ${newsId}:`, error);
      } finally {
        setLoadingComments(prev => ({ ...prev, [newsId]: false }));
      }
    }

    const element = document.getElementById(`comments-${newsId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [commentsMap, expandedComments, isAuthenticated, getAuthHeader]);

  const handleImageSwap = useCallback(() => {}, []);
  const openImageModal = useCallback((url: string) => {
    setImageModal({ visible: true, url });
  }, []);

  const closeImageModal = useCallback(() => {
    setImageModal({ visible: false, url: '' });
  }, []);

  const filteredNews = selectedCategories.length > 0
    ? news.filter(item => item.category && selectedCategories.includes(item.category.id))
    : news;

  return (
    <div className="life-ivits-container">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Жизнь института
      </motion.h2>

      <div className='novost-ivits'>
        <motion.div
          className='checkbox-novosti'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h4>Фильтр по категориям</h4>
          {categories.length > 0 ? (
            categories.map(category => (
              <label key={category.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                />
                <span className="checkbox-custom"></span>
                {category.name}
              </label>
            ))
          ) : (
            <p className="no-categories-message">Скоро тут будут категории</p>
          )}
        </motion.div>

        <div className='novost-items'>
          {isAuthenticated && ApiEndpointHelper.isAdmin(userData) && (
            <motion.button
              className="add-news-btn"
              onClick={() => setShowAddNews(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Добавить новость
            </motion.button>
          )}

          <AnimatePresence>
            {showAddNews && (
              <Addnews
                categories={categories}
                onClose={() => setShowAddNews(false)}
                onSuccess={fetchData}
              />
            )}
          </AnimatePresence>

          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item) => (
              <NewsItem
                key={item.id}
                item={item}
                onLike={handleLike}
                onCommentSubmit={handleCommentSubmit}
                onToggleComments={handleToggleComments}
                onImageSwap={handleImageSwap}
                onImageClick={openImageModal}
                comments={commentsMap[item.id] || []}
                showComments={!!expandedComments[item.id]}
                loadingComments={!!loadingComments[item.id]}
              />
            ))
          ) : (
            <motion.div
              className="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img src="/no-results.svg" alt="Нет результатов" />
              <p>{news.length === 0 ? 'Скоро тут будут новости' : 'Новостей по выбранным категориям не найдено'}</p>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {imageModal.visible && (
          <motion.div
            className="image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-modal" onClick={closeImageModal}>
                <IoMdClose />
              </button>
              <img src={imageModal.url} alt="Увеличенное изображение" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <EventCalendar />
      <Assistant />
    </div>
  );
};