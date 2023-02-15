import { useState, useEffect } from 'react'
import BandList from '../components/band-list'


const SingleLineup = () => {


    const apiLink = 'http://localhost:3001/api/lineups/10'

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
        // console.log("hello")
        fetch(apiLink)
            .then((response) => response.json())
            .then((data) => {
                setBands(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err.message);
            })  
    }, [])

    return(
        <BandList bands={bands} isLoading={isLoading} title="ACL 2015" />
    )
}

export default SingleLineup
