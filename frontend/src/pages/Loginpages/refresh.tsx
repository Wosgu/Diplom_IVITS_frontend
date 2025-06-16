import axios, { AxiosResponse } from 'axios';
import { ApiEndpointHelper } from '../../Context/AuthContext';
import Cookies from 'js-cookie';

type TokenResponse = {
  access: string;
};

type DecodedToken = {
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
  user_id: number;
};

export const TokenService = () => {
  const decodeToken = (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token', error);
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const decodedToken = decodeToken(token);
    if (!decodedToken) return true;

    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };

  const refreshAccessToken = async (): Promise<string> => {
    try {
      const response: AxiosResponse<TokenResponse> = await axios.post<TokenResponse>(
        ApiEndpointHelper.refresh(),
        {}, 
        {
          withCredentials: true
        }
      );

      const newAccessToken = response.data.access;
      console.log('Токен успешно обновлен:', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const getValidAccessToken = async (): Promise<string> => {
    let accessToken = Cookies.get('access_token');

    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }

    const newToken = await refreshAccessToken();
    return newToken;
  };

  return {
    refreshAccessToken,
    getValidAccessToken,
    isTokenExpired,
    decodeToken,
  };
};