import logo from '../hippohonk.png';
import Button from '../components/common/forms/button';

const Home = () => {
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
                <div className="festival-item">

                </div>
                <div className="festival-item">

                </div>
            </section>
            <section>

            </section>
        </main>
    )
}

export default Home
