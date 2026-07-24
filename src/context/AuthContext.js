import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { login } from "../api/mockApi";

const AUTH_TOKEN_KEY = "authToken";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] =
    useState(true);
  const [isSigningIn, setIsSigningIn] =
    useState(false);
  const [authError, setAuthError] = useState(null);

  // restore token from secure storage when app starts
  useEffect(() => {
    let isActive = true;

    async function restoreToken() {
      try {
        const savedToken =
          await SecureStore.getItemAsync(
            AUTH_TOKEN_KEY
          );

        if (!isActive) {
          return;
        }

        setToken(savedToken);
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Failed to restore authentication.";

        console.error(
          "Failed to restore auth token:",
          error
        );

        setAuthError(message);
      } finally {
        if (isActive) {
          setIsAuthLoading(false);
        }
      }
    }

    restoreToken();

    return () => {
      isActive = false;
    };
  }, []);

  async function signIn(username, password) {
    setIsSigningIn(true);
    setAuthError(null);

    try {
      const response = await login(
        username,
        password
      );

      await SecureStore.setItemAsync(
        AUTH_TOKEN_KEY,
        response.token
      );

      setToken(response.token);

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sign in failed.";

      console.error("Sign in failed:", error);
      setAuthError(message);

      return false;
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    setAuthError(null);

    try {
      await SecureStore.deleteItemAsync(
        AUTH_TOKEN_KEY
      );

      setToken(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Sign out failed.";

      console.error("Sign out failed:", error);
      setAuthError(message);
    }
  }

  function clearAuthError() {
    setAuthError(null);
  }

  const contextValue = {
    token,
    isAuthLoading,
    isSigningIn,
    authError,
    signIn,
    signOut,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}