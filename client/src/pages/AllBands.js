import { useState, useEffect } from 'react'
import BandList from '../components/band-list'


const AllBands = () => {


    const apiLink = '/api/bands/'

    const [bands, setBands] = useState([])
    const [isLoading, setIsLoading] = useState(true)


    useEffect(() => {
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
        <BandList bands={bands} isLoading={isLoading} title="Bands" />
    )
}

export default AllBands
