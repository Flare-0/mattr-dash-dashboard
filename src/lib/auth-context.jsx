import { createContext, useContext, useState, useEffect } from "react";
import { verifyApiKey } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [apiKey, setApiKey] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("api_key");
    if (stored) {
      setApiKey(stored);
      verifyApiKey(stored).then(setIsValid).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (key) => {
    localStorage.setItem("api_key", key);
    setApiKey(key);
    const res = await fetch("https://dev.mattr.art/api/verify", {
      headers: { "X-Auth-Key": key },
    });
    const data = await res.json();
    if (data.valid === true) {
      setIsValid(true);
      return true;
    }
    localStorage.removeItem("api_key");
    setApiKey(null);
    setIsValid(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem("api_key");
    setApiKey(null);
    setIsValid(null);
  };

  return (
    <AuthContext.Provider value={{ apiKey, isValid, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);