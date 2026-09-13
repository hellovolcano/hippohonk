import { useState, useEffect } from 'react'
import BandList from '../../components/band-list'
import BandReviewTable from '../../components/band-review-table'
import { useAuth } from '../../auth'

import { useParams } from 'react-router-dom'



const SingleLineup = props => {
    const { slug } = useParams()
    const { isLoggedIn, isReviewer } = useAuth()

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [festivalId, setFestivalId] = useState(null)
    const [reviewMode, setReviewMode] = useState(false)


    useEffect(() => {

        fetch('/api/festivals/' + slug)
            .then((response) => response.json())
            .then((data) => {

                const fest_id = data.id
                setTitle(data.name)
                setFestivalId(fest_id)

                fetch('/api/lineups/' + fest_id)
                    .then((response) => response.json())
                    .then((data) => {
                        setBands(data)
                        setIsLoading(false)
                    })
            })
            .catch((err) => {
                console.log(err.message)
            })
    }, [slug])

    const canReview = isLoggedIn && isReviewer

    return(
        <div>
            {canReview && (
                <div style={{ maxWidth: 600, margin: "1rem auto", textAlign: "right" }}>
                    <button onClick={() => setReviewMode((mode) => !mode)}>
                        {reviewMode ? "Exit Review Mode" : "Review Mode"}
                    </button>
                </div>
            )}

            {reviewMode && canReview ? (
                <BandReviewTable bands={bands} isLoading={isLoading} festivalId={festivalId} />
            ) : (
                <BandList bands={bands} isLoading={isLoading} title={title} />
            )}
        </div>
    )
}

export default SingleLineup
