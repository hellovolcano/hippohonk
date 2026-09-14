import BandForm from "../../components/band-form";
import { useAuth } from "../../auth";

const AddBand = () => {
  const { isLoggedIn, isReviewer, loading } = useAuth();

  if (loading) return <div>Loading…</div>;

  if (!isLoggedIn || !isReviewer) {
    return <div className="not-authorized">Not authorized.</div>;
  }

  return <BandForm mode="create" onSuccess={(b) => console.log("created", b)} />;
};

export default AddBand;
