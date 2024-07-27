/**
 * NotFound.js is a file that contains the 404 Not Found page component for if users try to access a page that does not exist
 * @author Sanjit Verma (skverma)
 */
import React from 'react';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404 Not Found</h1>
      <p style={styles.paragraph}>The page you are looking for does not exist on this server.</p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'start',
    height: '100vh',
    backgroundColor: 'rgb(20, 21, 21)',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Courier New',
    paddingLeft: '30px',
  },
  heading: {
    fontSize: '1.5em',
    fontWeight: '300',
    marginBottom: '1px',
  },
  paragraph: {
    fontSize: '0.9em',
  },
};

export default NotFound;
