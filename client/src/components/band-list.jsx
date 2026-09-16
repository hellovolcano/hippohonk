import { useEffect, useMemo, useState } from 'react'
import { CircularProgress, Chip, Stack } from '@mui/material'
import RecommendRoundedIcon from '@mui/icons-material/RecommendRounded'

import SectionWrapper from './common/section-wrapper'
import StyledPagination from './common/styled-pagination'
import DropDown from './common/forms/drop-down'
import BandImage from './band-image'
import { useAuth } from '../auth'
import './band-list.css'


const AddToFestivalControl = ({ band }) => {
    const [festivals, setFestivals] = useState([])
    const [status, setStatus] = useState('idle') // idle | adding | added | error
    const [selected, setSelected] = useState('')

    useEffect(() => {
        let cancelled = false

        fetch('/api/festivals/upcoming', { credentials: 'include' })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (!cancelled) setFestivals(Array.isArray(data) ? data : [])
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [])

    const handleChange = async (e) => {
        const festivalId = e.target.value
        if (!festivalId) return

        setStatus('adding')
        try {
            const res = await fetch('/api/lineups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ festival_id: Number(festivalId), band_id: band.band_id }),
            })

            if (!res.ok) throw new Error('Failed to add band to festival')

            setStatus('added')
            setTimeout(() => setStatus('idle'), 2000)
        } catch (err) {
            setStatus('error')
            setTimeout(() => setStatus('idle'), 2000)
        } finally {
            setSelected('')
        }
    }

    if (festivals.length === 0) return null

    const placeholder =
        status === 'adding'
            ? 'Adding…'
            : status === 'added'
            ? 'Added!'
            : status === 'error'
            ? 'Failed, try again'
            : '+ Add to festival'

    return (
        <div className="add-to-festival-select" onClick={(e) => e.stopPropagation()}>
            <DropDown
                name={`add-to-festival-${band.band_id}`}
                value={selected}
                onChange={handleChange}
                options={festivals.map((f) => ({ value: f.id, label: f.name }))}
                placeholder={placeholder}
                disabled={status === 'adding'}
            />
        </div>
    )
}

const BandList = ({bands, isLoading, title, showAddToFestival = false}) => {
    const { isLoggedIn, isReviewer } = useAuth()

    const [currentPage, setCurrentPage] = useState(1)
    const [bandsPerPage] = useState(10)
    const [search, setSearch] = useState('')

    const filteredBands = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return bands
        return bands.filter((band) => (band.name || '').toLowerCase().includes(q))
    }, [bands, search])

    const handleSearchChange = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    // Pagination-related variables
    const indexOfLastBand = currentPage * bandsPerPage
    const indexOfFirstBand = indexOfLastBand - bandsPerPage
    const currentBands = filteredBands.slice(indexOfFirstBand, indexOfLastBand)
    const numPages = Math.ceil(filteredBands.length / bandsPerPage)
    const rankMultiplier = (currentPage - 1) * bandsPerPage

    const handlePageChange = (event, value) => {
        setCurrentPage(value)
    }

    return(
        <div className="bandlist-wrapper">
        <SectionWrapper title={title}>
            <div className="band-search-wrapper">
                <input
                    type="search"
                    className="band-search-input"
                    placeholder="Search bands by name…"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>
            <div>
                {isLoading ?
                <Stack alignItems="center" margin="50px">
                    <CircularProgress/>
                </Stack> :
                currentBands.map((band, i) => (
                    <div key={i} className={i % 2 ? "band-row" : "band-row-alt"}>
                        <a className="band-list-link" href={'/band/' + band.band_id}>
                        <div className="band-container">
                            <BandImage spotifyImage={band.spotify_image} />
                            <div className="band-info">
                                <div>
                                    <span className="band-name">{band.name}</span>
                                    <span className="band-location">{band.location}</span>
                                </div>
                                <div className="band-details">
                                    <Chip label={band.average_rating} color="success" variant="outlined" icon={<RecommendRoundedIcon fontSize='small'/>} />
                                    <span className="band-description">{band.description}</span>
                                </div>
                            </div>
                        </div>
                        </a>
                        {showAddToFestival && isLoggedIn && isReviewer && (
                            <div className="band-row-actions">
                                <AddToFestivalControl band={band} />
                            </div>
                        )}
                        <span className="band-rank">{currentPage === 1 ? i + 1 : i + 1 + rankMultiplier}</span>
                    </div>
                ))}
                {!isLoading && filteredBands.length === 0 && (
                    <div className="empty-state">No bands match "{search}"</div>
                )}
            </div>
        </SectionWrapper>
        <Stack alignItems="center" margin="20px">
            <StyledPagination count={numPages} variant="outlined" size="large" siblingCount={2} page={currentPage} onChange={handlePageChange} sx={{textAlign: "center"}} />
        </Stack>
        </div>
    )
}

export default BandList
