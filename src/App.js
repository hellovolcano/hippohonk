import './App.css';
import { Routes, Route } from 'react-router-dom'
import Band from './pages/Band'
import Home from './pages/Home'
import Header from './components/header'
import AllBands from './pages/AllBands';
import theme from './themes/material-ui-theme'
import { ThemeProvider } from '@mui/material/styles';
import SingleLineup from './pages/Lineup';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/band" element={<Band/>} />
          <Route path="/bands" element={<AllBands/>} />
          <Route path="/lineups" element={<SingleLineup />} />
        </Routes>
      </div>
    </ThemeProvider>

    
  );
}

export default App;
