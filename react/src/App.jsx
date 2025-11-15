import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import Home from './components/Home';

function App() {
  // Never remove this block
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.handleRoutes === 'function') {
      window.handleRoutes(['/']);
    }
  }, []);

  return (
    <div data-easytag="id1-src/App.jsx">
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}

export default App;
