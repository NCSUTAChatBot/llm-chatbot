import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { visuallyHidden } from '@mui/utils';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const StyledBox = styled('div')(({ theme }) => ({
  alignSelf: 'center',
  width: '100%',
  height: 400,
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  outline: '1px solid',
  boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
  backgroundImage: `url(${'/_MAH0122.jpg'})`,
  outlineColor: 'hsla(220, 25%, 80%, 0.5)',
  backgroundSize: 'cover',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(10),
    height: 700,
  },
  ...theme.applyStyles('dark', {
    boxShadow: '0 0 24px 12px hsla(0, 0%, 75%, 0.8)',
    backgroundImage: `url(${'/_BK-1679.jpg'})`,
    outlineColor: 'hsla(210, 100%, 80%, 0.1)',
  }),
}));



export default function Hero() {
  const navigate = useNavigate();
  const handleChat = () => {
    navigate('/courseEvaluation/chat');
  } 
  return (
    <Box
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
              fontFamily: 'Mona',
              fontWeight: '400',
            }}
          >
            Course&nbsp;Evaluations&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                fontFamily: 'Mona',
                color: 'rgb(179, 33, 33)',
                fontWeight: '500',
              })}
            >
              Redefined
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '',
              fontFamily: 'Mona',
              width: {sm: '100%', md: '80%' },
            }}
          >
            Explore our revolutionary course evaluation platform that is designed to make the process of evaluating courses and instructors more efficient and effective.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            <InputLabel htmlFor="email-hero" sx={visuallyHidden}>
              Promt
            </InputLabel>
            <TextField
              id="email-hero"
              hiddenLabel
              size="small"
              variant="outlined"
              aria-label="Enter a prompt"
              placeholder="Enter a prompt"
              fontFamily="Mona"
              ba
              slotProps={{
                htmlInput: {
                  autoComplete: 'off',
                  'aria-label': 'Enter a prompt',
                },
              }}
            />
             <button type="submit" className="chatButton" onClick={handleChat} >
                    Chat Now
                </button> 
                
          </Stack>
          <Typography variant="caption" sx={{ textAlign: 'center' }}>
            By clicking &quot;Chat now&quot; you agree to our Terms & Conditions
            
            .
          </Typography>
        </Stack>
        <StyledBox id="image" />
      </Container>
    </Box>     
  );
}
