import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as persistToken, login as apiLogin, register as apiRegister } from '../api';

// Decode a JWT's payload without verifying it — verification happens on the
// server; we only read it here to show the user's email and to notice
// locally when a token has expired, so we can bounce to /login proactively
// instead of waiting for a 401.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpired(claims) {
  if (!claims?.exp) return false;
  return Date.now() >= claims.exp * 1000;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());

  const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const authenticated = Boolean(token) && !isExpired(claims);

  // If the stored token has already expired by the time the app loads,
  // clear it so the app doesn't briefly think we're logged in.
  useEffect(() => {
    if (token && isExpired(claims)) {
      persistToken(null);
      setTokenState(null);
    }
  }, [token, claims]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin({ email, password });
    setTokenState(data.token);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    return apiRegister({ name, email, password });
  }, []);

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
  }, []);

  const value = {
    authenticated,
    email: claims?.email ?? claims?.sub ?? claims?.unique_name ?? null,
    name: claims?.name ?? claims?.given_name ?? null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
