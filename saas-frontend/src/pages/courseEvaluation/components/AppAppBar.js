/**
 * @file AppAppBar.js modified MUI file for the course evaluation app bar stream
 * @author Sanjit Verma
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../../../globalStyles.css';

function AppAppBar() {

  // ENV VARIABLES
  const NAVBAR_HEADER = process.env.REACT_APP_CENAVBAR_HEADER;
  const FEEDBACK_URL = process.env.REACT_APP_FEEDBACK_FORM_URL;
  const navigate = useNavigate();

  const handleChat = () => {
    navigate('/commentSense/chat');
  } 
  
  const handleFeedback = () => {
    window.open(FEEDBACK_URL);
  };
  const [open, setOpen] = React.useState(false);

  return (
    <div className="top-bar-landingCE">
      <h1 className="title">{NAVBAR_HEADER} </h1>
      <div className="buttons">
        <button className="feedback-button" onClick={handleFeedback}>Leave Feedback</button>
        <button type="submit" className="feedback-button" onClick={handleChat}>
          Chat Now
        </button>
      </div>
    </div>
  );
}

AppAppBar.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default AppAppBar;
