import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Chatpage from './pages/taChatbot/chatpage.js';
import LoginPage from './pages/taChatbot/loginpage.js';
import SignupPage from './pages/taChatbot/signuppage.js';
import ForgotPassword from './pages/taChatbot/forgotpassword.js';
import ResetPassword from './pages/taChatbot/resetpassword.js';
import MUILanding from './pages/taChatbot/MUILanding.js';
import CELandingPage from './pages/courseEvaluation/LandingPage.js';
import CEChatPage from './pages/courseEvaluation/CEChatpage.js';
import './fonts/Arimo-Variable.ttf';
import './fonts/Mona-Sans.woff2';
function App() {
  return (
    <Routes>
      <Route path="/virtualTA" element={<MUILanding />} />
      <Route path="/virtualTA/chat" element={<Chatpage />} />
      <Route path="/virtualTA/login" element={<LoginPage />} />
      <Route path="/virtualTA/signup" element={<SignupPage />} />
      <Route path="/virtualTA/forgotpassword" element={<ForgotPassword/>} />
      <Route path='/virtualTA/reset_password' element={<ResetPassword/>} />
      

      <Route path="/courseEvaluation" element={<CELandingPage/>} />
      <Route path="/courseEvaluation/chat" element={<CEChatPage/>} />
    </Routes>
  );
}

export default App;
