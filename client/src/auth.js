import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me", { credentials: "include" })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isReviewer: !!user?.reviewer,
    isAdmin: !!user?.admin,
    loading,
  };
}
