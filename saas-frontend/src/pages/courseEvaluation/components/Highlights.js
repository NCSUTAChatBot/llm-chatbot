import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Adaptable performance',
    description:
      'Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Built to last',
    description:
      'Experience unmatched durability that goes above and beyond with lasting investment.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Great user experience',
    description:
      'Integrate our product into your routine with an intuitive and easy-to-use interface.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Innovative functionality',
    description:
      'Stay ahead with features that set new standards, addressing your evolving needs better than the rest.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Reliable support',
    description:
      'Count on our responsive customer support, offering assistance that goes beyond the purchase.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Precision in every detail',
    description:
      'Enjoy a meticulously crafted product where small touches make a significant impact on your overall experience.',
  },
];

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
    <small className="landingbox-box-small">IO want to find areas to improve my class</small>
  </div>
</div>


      </Container>
    </Box>
  );
}
