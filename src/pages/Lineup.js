import { useState, useEffect } from 'react'
import BandList from '../components/band-list'

import { useParams } from 'react-router-dom'



const SingleLineup = props => {

    const {slug: slug } = useParams()

    console.log(slug)

    const festivalLink = 'http://localhost:3001/api/festivals/' + slug

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [title, setTitle] = useState('')


    useEffect(() => {
        // console.log("hello")
        fetch('http://localhost:3001/api/festivals/' + slug)
            .then((response) => response.json())
            .then((data) => {

                const fest_id = data.id
                setTitle(data.name)

                fetch('http://localhost:3001/api/lineups/' + fest_id)
                    .then((response) => response.json())
                    .then((data) => {
                        setBands(data)
                        setIsLoading(false)
                    })
            })
            .catch((err) => {
                console.log(err.message)
            })
    }, [])

    return(
        <BandList bands={bands} isLoading={isLoading} title={title} />
    )
}

export default SingleLineup
