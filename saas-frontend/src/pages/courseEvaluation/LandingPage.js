/**
 * @file LandingPage.js is the landing page for the course evaluation stream
 * 
 * @author Sanjit Verma
 * website template adapted from MUI https://github.com/mui/material-ui/tree/v5.15.9/docs/data/material/getting-started/templates
 */
import * as React from 'react';


import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Highlights from './components/Highlights';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import getLPTheme from './getLPTheme';



export default function LandingPage() {
  const [mode] = React.useState('dark');
  const LPtheme = createTheme(getLPTheme(mode));
  
  return (
    <ThemeProvider theme={ LPtheme}>
      <div style={{backgroundColor: '#DAD6D6'}}>
      <AppAppBar  />
      <Hero />
      <Box sx={{ bgcolor: 'background.default' }}>
        <LogoCollection />
        <Divider />
        <Highlights />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </Box>
      </div> 
    </ThemeProvider>

  );
}
