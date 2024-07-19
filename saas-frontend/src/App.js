import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/taChatbot/landingpage.js';
import Chatpage from './pages/taChatbot/chatpage.js';
import LoginPage from './pages/taChatbot/loginpage.js';
import SignupPage from './pages/taChatbot/signuppage.js';
import ForgotPassword from './pages/taChatbot/forgotpassword.js';
import ResetPassword from './pages/taChatbot/resetpassword.js';
import './fonts/Arimo-Variable.ttf';
import './fonts/Mona-Sans.woff2';
function App() {
  return (
    <Routes>
      <Route path="/virtualTA" element={<LandingPage />} />
      <Route path="/virtualTA/chat" element={<Chatpage />} />
      <Route path="/virtualTA/login" element={<LoginPage />} />
      <Route path="/virtualTA/signup" element={<SignupPage />} />
      <Route path="/virtualTA/forgotpassword" element={<ForgotPassword/>} />
      <Route path='/virtualTA/reset_password' element={<ResetPassword/>} />
    </Routes>
  );
}

export default App;
