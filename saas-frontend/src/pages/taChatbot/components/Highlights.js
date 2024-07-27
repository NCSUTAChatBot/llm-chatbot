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
            <p>Explain Problem 1 from the Homework 1 assignment </p>
            <small className="landingbox-box-small">I need help with problem 1 from the first assignment</small>
          </div>
          <div className="landingbox-box">
            <p>When are my professor's office hours on Tuesdays and Thursdays?</p>
            <small className="landingbox-box-small">I need to discuss my last exam in the office hours</small>
          </div>
          <div className="landingbox-box">
            <p>Can you explain Chapter 2 Section 2 of the Engineering SAAS textbook?</p>
            <small className="landingbox-box-small">I need a refresher of the content from the last class</small>
          </div>
          <div className="landingbox-box">
            <p>When is our midterm 1 exam and what topics will the exam cover?</p>
            <small className="landingbox-box-small">I'm not sure when our next midterm is and how to prepare for it</small>
          </div>
          <div className="landingbox-box">
            <p>What percentage of our class grade is projects?</p>
            <small className="landingbox-box-small">I want to know the project weight for our class</small>
          </div>
          <div className="landingbox-box">
            <p>How can I contact my TA, Sanjit, for help?</p>
            <small className="landingbox-box-small">I need help debugging an issue in my code</small>
          </div>

        </div>
      </Container>
    </Box>
  );
}
