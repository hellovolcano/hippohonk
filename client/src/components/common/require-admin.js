import { useAuth } from "../../auth";

const RequireAdmin = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading…</div>;

  if (!isLoggedIn || !isAdmin) {
    return <div className="not-authorized">Not authorized.</div>;
  }

  return children;
};

export default RequireAdmin;
