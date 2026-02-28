import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, User, getToken, getStoredUser, removeStoredUser } from '../services/api';

// Internal token management
const TOKEN_KEY = 'pm_auth_token';

const setTokenInternal = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
};

const removeTokenInternal = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state from storage
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Verify token validity periodically
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        const response = await authApi.getProfile();
        if (response.error) {
          // Token invalid - clear state
          setUser(null);
          setTokenState(null);
          removeTokenInternal();
          removeStoredUser();
          navigate('/login');
        } else if (response.data) {
          setUser(response.data.user);
        }
      }
    };
    
    if (token) {
      verifyToken();
      // Verify token every 5 minutes
      const interval = setInterval(verifyToken, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [token, navigate]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await authApi.login(email, password, rememberMe);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }

    if (response.data) {
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setTokenState(authToken);
      // Store token using internal function
      setTokenInternal(authToken, rememberMe);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  }, []);

  const register = useCallback(async (userData: Partial<User> & { password: string }, rememberMe: boolean = false): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await authApi.register(userData, rememberMe);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }

    if (response.data) {
      const { user: respUser, token: authToken } = response.data;
      setUser(respUser);
      setTokenState(authToken);
      setTokenInternal(authToken, rememberMe);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
    removeTokenInternal();
    removeStoredUser();
    navigate('/login');
  }, [navigate]);

  const updateProfile = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const response = await authApi.updateProfile(userData);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return false;
    }

    if (response.data) {
      setUser(response.data.user);
      setLoading(false);
      return true;
    }

    setLoading(false);
    return false;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;