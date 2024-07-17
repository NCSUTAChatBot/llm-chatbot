import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage.js';
import Chatpage from './pages/chatpage.js';
import LoginPage from './pages/loginpage.js';
import SignupPage from './pages/signuppage.js';
import ForgotPassword from './pages/forgotpassword.js';
import ResetPassword from './pages/resetpassword.js';
import ModelsPage from './pages/modelspage.js';
import CEChatPage from './pages/courseEvaluation/chatpage.js';
import './fonts/Arimo-Variable.ttf';
import './fonts/Mona-Sans.woff2';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chat" element={<Chatpage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgotpassword" element={<ForgotPassword/>} />
      <Route path='/reset_password' element={<ResetPassword/>} />
      <Route path="/models" element={<ModelsPage />} />
      <Route path="/CEchat" element={<CEChatPage />} />
    </Routes>
  );
}

export default App;
