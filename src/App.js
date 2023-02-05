import './App.css';
import { Routes, Route } from 'react-router-dom'
import Band from './pages/Band'
import Home from './pages/Home'
import Header from './components/header'
import BandList from './pages/BandList';
import theme from './themes/material-ui-theme'
import { ThemeProvider } from '@mui/material/styles';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/band" element={<Band/>} />
          <Route path="/bands" element={<BandList/>} />
        </Routes>
      </div>
    </ThemeProvider>

    
  );
}

export default App;
