/**
 * This component is responsible for rendering the hero section of the landing page.
 * 
 * @author Sanjit Verma 
 */
import { useState, useEffect } from 'react';
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
    boxShadow: '0 0 22px 5px hsla(0, 0%, 75%, 0.8)',
    backgroundImage: `url(${'/_MAH0056.jpg'})`,
    outlineColor: 'hsla(210, 100%, 80%, 0.1)',
  }),
}));

const randomTexts = [
  "Get started with a prompt",
  "Ask me anything about the course",
  "Need help? Type your question",
  "How can I assist you today?",
  "Let's start with your query"
];

export default function Hero() {
  const navigate = useNavigate();
  const handleChat = () => {
    navigate('/virtualTA/chat');
  };

  const [placeholderText, setPlaceholderText] = useState(randomTexts[0]);
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typingInterval = setInterval(() => {
      setPlaceholderText(randomTexts[index].slice(0, charIndex + 1));
      setCharIndex((prev) => prev + 1);

      if (charIndex === randomTexts[index].length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setCharIndex(0);
          setIndex((prev) => (prev + 1) % randomTexts.length);
        }, 3000);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [charIndex, index]);

  return (
    <Box>
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
              fontSize: 'clamp(3rem, 10vw, 3.2rem)',
              fontFamily: 'Mona',
              fontWeight: '300',
              color: '#E4E6EB',
            }}
          >
            &nbsp;Teaching Assistant&nbsp;Support&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                fontFamily: 'Mona',
                color: '#FFFFFF',
                fontWeight: '400',
              })}
            >
              24/7
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#E4E6EB',
              fontFamily: 'Mona',
              width: { sm: '100%', md: '80%' },
              fontWeight: '300',
            }}
          >
            Explore our innovative TA Chatbot, redefining teaching support and streamlining your academic journey with unparalleled efficiency and effectiveness.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            <InputLabel htmlFor="email-hero" sx={visuallyHidden}>
              Prompt
            </InputLabel>
            <TextField
              id="email-hero"
              hiddenLabel
              size="small"
              variant="outlined"
              aria-label="Enter a prompt"
              placeholder={placeholderText}
              fontFamily="Mona"
              disabled="true"
              slotProps={{
                htmlInput: {
                  autoComplete: 'off',
                  'aria-label': 'Enter a prompt',
                },
              }}
              sx={{ width: '350px' }}
            />
            <button type="submit" className="landingChatButton" onClick={handleChat} style={{ width: '100px', height: '35px', marginTop: '3px'}}>
              Chat Now
            </button>
          </Stack>
          <Typography variant="caption" sx={{ fontWeight: '300', textAlign: 'center', fontFamily: 'Mona', color: '#E4E6EB' }}>
            By using our services, you agree to our Terms & Conditions.
          </Typography>
        </Stack>
        <StyledBox id="image" />
      </Container>
    </Box>
  );
}
