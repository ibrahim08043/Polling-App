
import { useState, useEffect } from "react";

interface User {
  email: string;
  name?: string;
  _id?: string;
}

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuthStatus = () => {
      const userData = localStorage.getItem("user");
      setIsLoggedIn(!!userData);
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log(parsedUser, "parsedUser")
          setUser({
            email: parsedUser.email,
            name: parsedUser.username,
            _id: parsedUser.id
          });
        } catch (err) {
          console.error("Failed to parse user:", err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  return {
    isLoggedIn,
    user,
    loading,
    logout
  };
};
