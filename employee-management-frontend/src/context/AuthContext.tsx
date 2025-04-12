import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import { loginUser, getCurrentUser } from "../services/authService";
import { UserLoginDto, UserInfoDto } from "../types/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfoDto | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLoginDto) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get token from storage
const getTokenFromStorage = (): string | null =>
  localStorage.getItem("authToken");

// Helper function to set token in storage
const setTokenInStorage = (token: string | null): void => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(getTokenFromStorage());
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validate Token and Fetch User on Load
  const validateTokenAndFetchUser = useCallback(
    async (currentToken: string) => {
      console.log("Validating token and fetching user...");
      setIsLoading(true);
      setError(null);
      try {
        const userInfo = await getCurrentUser();
        setUser(userInfo);
        setToken(currentToken); // Ensure token state is correct
        console.log("Token validated, user fetched:", userInfo);
      } catch (err) {
        console.error("Token validation/fetch user failed:", err);
        setToken(null); // Clear invalid token from state
        setUser(null);
        setTokenInStorage(null); // Clear from storage
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const storedToken = getTokenFromStorage();
    if (storedToken) {
      validateTokenAndFetchUser(storedToken);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login Function
  const login = async (credentials: UserLoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      setToken(response.token);
      setTokenInStorage(response.token); // Store token
      await validateTokenAndFetchUser(response.token);
    } catch (err: any) {
      console.error("Login failed:", err);
      setToken(null);
      setUser(null);
      setTokenInStorage(null);
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password.");
      } else if (err.request) {
        setError("Could not connect to the server. Please try again later.");
      } else {
        setError("An unexpected error occurred during login.");
      }
      throw err;
    } finally {
      // setIsLoading(false); // Loading state is handled by validateTokenAndFetchUser
    }
  };

  // Logout Function
  const logout = () => {
    console.log("Logging out...");
    setToken(null);
    setUser(null);
    setError(null);
    setTokenInStorage(null); // remove token from storage
    navigate("/login", { replace: true });
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isAuthenticated: !!token && !!user,
      user,
      token,
      isLoading,
      error,
      login,
      logout,
    }),
    [token, user, isLoading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
