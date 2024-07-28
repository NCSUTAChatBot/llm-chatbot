// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage';
import ChatPage from './pages/chatpage';
import LoginPage from './pages/loginpage';
import SignupPage from './pages/signuppage';
import ForgotPassword from './pages/forgotpassword';
import ResetPassword from './pages/resetpassword';
import './globalStyles.css';
import { useColorScheme } from './hooks/useColorScheme'; 

function App() {
  const { isDark, setIsDark } = useColorScheme();  // 使用钩子

  const toggleTheme = () => {
    setIsDark(!isDark);  // 切换主题
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path='/reset_password' element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
