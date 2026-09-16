import { useState, useEffect, useRef } from 'react'
import BandList from '../../components/band-list'
import BandReviewTable from '../../components/band-review-table'
import Button from '../../components/common/forms/button'
import { useAuth } from '../../auth'

import { useParams } from 'react-router-dom'
import './lineup.css'



const SingleLineup = props => {
    const { slug } = useParams()
    const { isLoggedIn, isReviewer, isAdmin } = useAuth()

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [festivalId, setFestivalId] = useState(null)
    const [reviewMode, setReviewMode] = useState(false)
    const [reviewState, setReviewState] = useState({ dirtyCount: 0, saving: false })
    const [hideOtherReviewers, setHideOtherReviewers] = useState(false)
    const [listeningPartyMode, setListeningPartyMode] = useState(false)
    const reviewTableRef = useRef(null)

    const toggleListeningPartyMode = () => {
        setListeningPartyMode((mode) => !mode)
        // Listening Party Mode needs every reviewer's column visible to enter
        // their ratings, so it doesn't make sense alongside this.
        setHideOtherReviewers(false)
    }


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
                <div className="lineup-toolbar">
                    <div className="lineup-toolbar-left">
                        {reviewMode && (
                            <>
                                <Button onClick={() => reviewTableRef.current?.addRow()}>+ Add Band</Button>
                                <span className="toolbar-divider" aria-hidden="true" />
                                {!listeningPartyMode && (
                                    <Button onClick={() => setHideOtherReviewers((v) => !v)}>
                                        {hideOtherReviewers ? "Show All Reviewers" : "Hide Other Reviewers"}
                                    </Button>
                                )}
                                {isAdmin && (
                                    <Button variant="accent" onClick={toggleListeningPartyMode}>
                                        {listeningPartyMode ? "Exit Listening Party Mode" : "Listening Party Mode"}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    <div className="lineup-toolbar-right">
                        {reviewMode && (
                            <Button
                                variant="secondary"
                                onClick={() => reviewTableRef.current?.save()}
                                disabled={reviewState.saving || reviewState.dirtyCount === 0}
                            >
                                {reviewState.saving
                                    ? "Saving…"
                                    : `Save${reviewState.dirtyCount > 0 ? ` (${reviewState.dirtyCount})` : ""}`}
                            </Button>
                        )}
                        <Button onClick={() => setReviewMode((mode) => !mode)}>
                            {reviewMode ? "Exit Review Mode" : "Review Mode"}
                        </Button>
                    </div>
                </div>
            )}

            {reviewMode && canReview ? (
                <BandReviewTable
                    ref={reviewTableRef}
                    bands={bands}
                    isLoading={isLoading}
                    festivalId={festivalId}
                    onStateChange={setReviewState}
                    hideOtherReviewers={hideOtherReviewers}
                    listeningPartyMode={listeningPartyMode && isAdmin}
                />
            ) : (
                <BandList bands={bands} isLoading={isLoading} title={title} />
            )}
        </div>
    )
}

export default SingleLineup
