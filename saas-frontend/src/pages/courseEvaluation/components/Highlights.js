/**
 * @file Highlights.js modified component file for the course evaluation highlights section
 * @author Sanjit Verma
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'rgba(15, 14, 14, 0.9)',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4">
            Suggested Prompts
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
          Explore some common prompts that can assist you in your course evaluation journey. Enjoy the convenience of asking questions and gaining insights from your course evaluations with our LLM-powered bot.          </Typography>
        </Box>
        <div className="landingbox-container">
  <div className="landingbox-box">
    <p>What did my students think about the difficulty of the exams?</p>
    <small className="landingbox-box-small">I want to know what students thought about my exams</small>
  </div>
  <div className="landingbox-box">
    <p>Were the instructions for assignments and exams clear to students?</p>
    <small className="landingbox-box-small">I need to know if I should improve my assignment instructions</small>
  </div>
  <div className="landingbox-box">
    <p>What feedback did students give about my lectures?</p>
    <small className="landingbox-box-small">I want to know if my teaching style works</small>
  </div>
  <div className="landingbox-box">
    <p>How engaged did students feel during the lectures and activities?</p>
    <small className="landingbox-box-small">I need to know if my activities and lectures were useful</small>
  </div>
  <div className="landingbox-box">
    <p>What do you recommend I can do to increase classroom engagement? </p>
    <small className="landingbox-box-small">I am having trouble keeping the class engaged</small>
  </div>
  <div className="landingbox-box">
    <p>What aspects of the course did students think could be better?</p>
    <small className="landingbox-box-small">I want to find areas to improve my class</small>
  </div>
</div>


      </Container>
    </Box>
  );
}
