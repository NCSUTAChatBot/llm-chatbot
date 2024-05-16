import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage.js';
import Chatpage from './pages/chatpage.js';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<Chatpage />} />
    </Routes>
  );
}

export default App;
