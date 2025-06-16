import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import axios from 'axios';
import { TokenService } from "../pages/Loginpages/refresh";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface UserData {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  role: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  vk_avatar?: string;
  groups?: number[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (accessToken: string, user?: Partial<UserData>) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  getAuthHeader: () => Promise<{ headers: { Authorization: string } }>;
}

class ApiEndpointHelper {
  static getBaseUrl() {
    throw new Error('Method not implemented.');
  }
  private static baseUrl = import.meta.env.VITE_BASE_URL_ENDPOINTS;

  static getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  static vkAuthCallback(): string {
    return this.getUrl('/api/auth/vk/callback/');
  }

  static vkAuthInit(redirectUri: string): string {
    return this.getUrl(`/api/auth/vk/init/?redirect_uri=${redirectUri}`);
  }

  static registerInit(): string {
    return this.getUrl('/api/register/init/');
  }

  static registerConfirm(): string {
    return this.getUrl('/api/register/confirm/');
  }

  static login(): string {
    return this.getUrl('/api/login/');
  }

  static userMe(): string {
    return this.getUrl('/api/users/me/');
  }

  static banners(): string {
    return this.getUrl('/api/banners/');
  }

  static latest_news(): string {
    return this.getUrl('/api/news/latest_news/');
  }

  static departaments(): string {
    return this.getUrl('/api/departments/with-programs/')
  }

  static achievement(): string {
    return this.getUrl('/api/achievements/')
  }

  static reviews(): string {
    return this.getUrl('/api/reviews/')
  }

  static hasRole(user: UserData | null, ...roles: string[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  }

  static isAdmin(user: UserData | null): boolean {
    return this.hasRole(user, 'admin');
  }

  static applicationtypes(): string {
    return this.getUrl('/api/application-types/');
  }

  static applications(): string {
    return this.getUrl('/api/applications/');
  }

  static applicationsid(): string {
    return this.getUrl('/api/applications/${id}/');
  }

  static groups(): string {
    return this.getUrl('/api/groups/');
  }

  static programs(): string {
    return this.getUrl('/api/programs/');
  }

  static comments(): string {
    return this.getUrl('/api/comments/');
  }

  static commentsnews(): string {
    return this.getUrl('/api/comments/?news=${newsId}/');
  }

  static likes(): string {
    return this.getUrl('/api/news/${newsId}/like/');
  }

  static news(): string {
    return this.getUrl('/api/news/');
  }

  static categories(): string {
    return this.getUrl('/api/categories/');
  }

  static tags(): string {
    return this.getUrl('/api/tags/');
  }

  static audiences(): string {
    return this.getUrl('/api/audiences/');
  }

  static audienceimages(): string {
    return this.getUrl('/api/audience-images/');
  }

  static characteristics(): string {
    return this.getUrl('/api/characteristics/');
  }

  static documents(): string {
    return this.getUrl('/api/documents/');
  }

  static refresh(): string {
    return this.getUrl('/api/token/refresh/');
  } 

  static events(): string {
    return this.getUrl('/api/events/');
  }

  static faculty(): string {
    return this.getUrl('/api/faculty/');
  }

  static questions(): string {
    return this.getUrl('/api/questions/');
  }

  static starttest(): string {
    return this.getUrl('/api/start-test/');
  }

  static questiongroups(): string {
    return this.getUrl('/api/question-groups/');
  }

  static answer(): string {
    return this.getUrl('/api/sessions/${sessionId}/answers/');
  }

  static complete(): string {
    return this.getUrl('/api/sessions/${sessionId}/complete/');
  }

  static result(): string {
    return this.getUrl('/api/results/${sessionId}/');
  }

  static logout(): string {
    return this.getUrl('/api/logout/');
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userData: null as UserData | null,
    isLoading: true
  });

  const tokenServiceRef = useRef(TokenService());
  const navigate = useNavigate();

  const saveAccessToken = useCallback((token: string) => {
    Cookies.set('access_token', token, {
      expires: 1, // 1 день
      secure: true,
      sameSite: 'strict'
    });
  }, []);

  const getAuthHeader = useCallback(async () => {
    try {
      const token = await tokenServiceRef.current.getValidAccessToken();
      saveAccessToken(token); // Обновляем токен в куках при каждом запросе
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    } catch (error) {
      console.error('Failed to get valid access token', error);
      throw error;
    }
  }, [saveAccessToken]);

  const fetchUserData = useCallback(async (): Promise<UserData> => {
    try {
      const authHeader = await getAuthHeader();
      const response = await axios.get<UserData>(ApiEndpointHelper.userMe(), authHeader);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      throw error;
    }
  }, [getAuthHeader]);

  const checkAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setAuthState({ isAuthenticated: false, userData: null, isLoading: false });
        return;
      }

      const newToken = await tokenServiceRef.current.getValidAccessToken();
      saveAccessToken(newToken);
      const userData = await fetchUserData();
      setAuthState({ isAuthenticated: true, userData, isLoading: false });
    } catch (error) {
      setAuthState({ isAuthenticated: false, userData: null, isLoading: false });
      Cookies.remove('access_token');
    }
  }, [fetchUserData, saveAccessToken]);

  const login = useCallback(async (accessToken: string, user?: Partial<UserData>) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      saveAccessToken(accessToken);
      const freshUserData = await fetchUserData();
      setAuthState({
        isAuthenticated: true,
        userData: {
          ...freshUserData,
          ...(user?.vk_avatar && { vk_avatar: user.vk_avatar })
        },
        isLoading: false
      });
      navigate('/');
    } catch (error) {
      if (user) {
        setAuthState({
          isAuthenticated: true,
          userData: {
            id: user.id || 0,
            username: user.username || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            middle_name: user.middle_name || '',
            role: user.role || 'guest',
            email: user.email || '',
            phone: user.phone || null,
            is_active: user.is_active || false,
            vk_avatar: user.vk_avatar,
            groups: user.groups || []
          },
          isLoading: false
        });
        navigate('/dashboard');
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        throw error;
      }
    }
  }, [fetchUserData, navigate, saveAccessToken]);

  const logout = useCallback(async () => {
    try {
      const authHeader = await getAuthHeader();
      await axios.post(
        ApiEndpointHelper.logout(), 
        {}, 
        { 
          withCredentials: true,
          ...authHeader
        }
      );
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      Cookies.remove('access_token');
      setAuthState({ isAuthenticated: false, userData: null, isLoading: false });
      navigate('/');
    }
  }, [navigate, getAuthHeader]);

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth();
    };
    initializeAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkTokenExpiration = async () => {
      try {
        const token = Cookies.get('access_token');
        if (!token) return;

        const decoded = tokenServiceRef.current.decodeToken(token);
        if (!decoded) return;

        const expiresIn = (decoded.exp * 1000) - Date.now();
        if (expiresIn < 60000) { // Если осталось меньше минуты
          const newToken = await tokenServiceRef.current.getValidAccessToken();
          saveAccessToken(newToken);
        }
      } catch (error) {
        console.error("Ошибка проверки токена:", error);
      }
    };

    const interval = setInterval(checkTokenExpiration, 30000); // Проверка каждые 30 секунд
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, saveAccessToken]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      checkAuth,
      getAuthHeader
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { ApiEndpointHelper };