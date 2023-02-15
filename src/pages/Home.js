import logo from '../hippohonk.png';
import Button from '../components/common/forms/button';
import FestivalItem from '../components/festival-item';
import { useState, useEffect } from 'react'
import { Stack, CircularProgress } from '@mui/material';

const Home = () => {

    const [festivals, setFestivals] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // console.log("hello")
        fetch('http://localhost:3001/api/festivals/')
            .then((response) => response.json())
            .then((data) => {
                setFestivals(data)
                setIsLoading(false)
            })
            .catch((err) => {
                console.log(err.message);
            })  
    }, [])

    return (
        <main>
            <section className="hero-section">
                <div className="hero-image">
                    <img src={logo} className="App-logo" alt="logo" />
                </div>
                <div className="hero-text">
                    <h1>Music festival ratings</h1>
                    <p>by fanatics just like you</p>
                </div>
                <div className="hero-cta">
                    <Button>Check it</Button>
                </div>
            
            </section>
            <section className="festival-section">
                {isLoading ? 
                <Stack alignItems="center" margin="50px">
                    <CircularProgress/>
                </Stack> : festivals.map((festival, i) => (
                    <FestivalItem key={i} festival={festival} />
                ))}
            </section>
            <section>

            </section>
        </main>
    )
}

export default Home
