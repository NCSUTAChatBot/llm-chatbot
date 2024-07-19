import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const whiteLogos = [
  `${process.env.PUBLIC_URL}/ncstate-brick-2x2-red.png`
];

const logoStyle = {
  width: '160px',
  height: '80px',
  margin: '10px 35px',
  opacity: 1,
};

export default function LogoCollection() {
  const theme = useTheme();
  const logos =  whiteLogos;

  return (
    <Box id="logoCollection" sx={{ py: 4, backgroundColor:'rgba(15, 14, 14, 0.9)' }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        sx={{ color: 'white' }}
        fontFamily="Mona"
      >
        Used at these Universities
      </Typography>
      <Grid container sx={{ justifyContent: 'center', mt: 0.5, opacity: 0.6 }}>
        {logos.map((logo, index) => (
          <Grid item key={index}>
            <img
              src={logo}
              alt={`University ${index + 1}`}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
