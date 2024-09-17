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
            <p>Summarize 1.10 Guided Tour and How To Use This Book</p>
            <small className="landingbox-box-small">I need want a quick summary of a chapter or concept</small>
          </div>
          <div className="landingbox-box">
            <p>Explain what a dependency manager is and why it's needed?</p>
            <small className="landingbox-box-small">I don't understand a concept and need an explanation</small>
          </div>
          <div className="landingbox-box">
            <p>What is the SMART acronym stand for, what is it used for?</p>
            <small className="landingbox-box-small">I need a refresher of the content from today's reading</small>
          </div>
          <div className="landingbox-box">
            <p>Provide the example from Figure 2.10 that finds the maximum-valued element</p>
            <small className="landingbox-box-small">I need a sample of code from the textbook.</small>
          </div>
          <div className="landingbox-box">
            <p>Why is Self-Check 10.1.1 Scrum is appropriate when it is difficult to plan ahead true? </p>
            <small className="landingbox-box-small">I need some further explanation for the self check</small>
          </div>
          <div className="landingbox-box">
            <p>What does this book talk about, who is the author?</p>
            <small className="landingbox-box-small">I want to learn more about the textbook and authors</small>
          </div>

        </div>
      </Container>
    </Box>
  );
}
