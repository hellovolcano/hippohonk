import BandForm from "../components/band-form"
import { useAuth } from "../auth"

export const AddBand = () => {
    const { isLoggedIn, isReviewer, loading } = useAuth()

    if (loading) return <div>Loading…</div>

    if (!isLoggedIn || !isReviewer) {
        return <div style={{ maxWidth: 600, margin: "2rem auto" }}>Not authorized.</div>
    }

    return (
        <BandForm mode="create" onSuccess={(b) => console.log("created", b)} />
    )
}
