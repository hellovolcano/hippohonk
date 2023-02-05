import './App.css';
import { Routes, Route } from 'react-router-dom'
import Band from './pages/Band'
import Home from './pages/Home'
import Header from './components/header'
import BandList from './pages/BandList';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/band" element={<Band/>} />
        <Route path="/bands" element={<BandList/>} />
      </Routes>
    </div>

    
  );
}

export default App;
