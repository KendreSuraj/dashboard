import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import LogIn from './pages/Login/LogIn';
import Dashboard from './pages/Dashboard/Dashboard';
import Header from './components/header/Header';
function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route exact path="/" element={<LogIn />} />
          <Route exact path="/login" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
