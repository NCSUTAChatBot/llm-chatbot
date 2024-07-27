/**
 * @file SimpleFooter.js simple version of the modified component file for the course evaluation footer
 * @author Sanjit Verma
 */

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GitHubIcon from '@mui/icons-material/GitHub';  // Correct icon import

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'white', mt: 1 }}>
      {'Copyright © '}
      <Link href="https://www.csc.ncsu.edu/" style={{color: 'white'}}>NC State University </Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function SimpleFooter() {
  return (
    <div style={{backgroundColor: 'rgb(20, 21, 21)', position: 'fixed', bottom: 0, width: '100%', height: '110px'}}>
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          py: 2,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 2,
            width: '95vw',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <div>
            <Link color="#FFFFFF" variant="body2" href="#">
               &nbsp;Privacy Policy
            </Link>
            <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>
              &nbsp;•&nbsp;
            </Typography>
            <Link color="#FFFFFF" variant="body2" href="#">
              Terms of Service
            </Link>
            &nbsp; &nbsp; &nbsp;<Copyright />
          </div>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ justifyContent: 'flex-end', color: '#FFFFFF' }}
          >
            <IconButton
              href="https://github.com/NCSUTAChatBot/llm-chatbot"
              aria-label="GitHub"
              sx={{ alignSelf: 'center', color: 'white' }}
            >
              <GitHubIcon />
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </div>
  );
}
