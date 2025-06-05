import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import TournamentCreation from './pages/TournamentCreation'
import TournamentOverview from './pages/TournamentOverview'
import MatchDetail from './pages/MatchDetail'
import OverviewDiagram from './pages/OverviewDiagram'
import Settings from './pages/Settings'
import { TournamentProvider } from './context/TournamentContext'
import { ThemeProvider } from './context/ThemeContext'
import Navigation from './components/Navigation'
import './App.css'

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TournamentProvider>
        <Router>
          <Navigation />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/create' element={<TournamentCreation />} />
            <Route path='/tournament/:id' element={<TournamentOverview />} />
            <Route path='/match/:id' element={<MatchDetail />} />
            <Route path='/overview' element={<OverviewDiagram />} />
            <Route path='/settings' element={<Settings />} />
          </Routes>
        </Router>
      </TournamentProvider>
    </ThemeProvider>
  )
}

export default App;
