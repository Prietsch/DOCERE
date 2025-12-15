import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2A4B8D', // Royal blue
      light: '#4267A9',
      dark: '#1A3366',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AF37', // Gold
      light: '#F7E98D',
      dark: '#C79D26',
      contrastText: '#2A4B8D',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2A4B8D',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Georgia", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Georgia", serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Georgia", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Georgia", serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(31, 41, 55, 0.06)',
    '0px 4px 6px rgba(31, 41, 55, 0.1)',
    '0px 4px 8px rgba(31, 41, 55, 0.1)',
    '0px 6px 10px rgba(31, 41, 55, 0.1)',
    '0px 8px 12px rgba(31, 41, 55, 0.1)',
    '0px 10px 14px rgba(31, 41, 55, 0.1)',
    '0px 12px 16px rgba(31, 41, 55, 0.1)',
    '0px 14px 18px rgba(31, 41, 55, 0.1)',
    '0px 16px 20px rgba(31, 41, 55, 0.1)',
    '0px 18px 22px rgba(31, 41, 55, 0.1)',
    '0px 20px 24px rgba(31, 41, 55, 0.1)',
    '0px 22px 26px rgba(31, 41, 55, 0.1)',
    '0px 24px 28px rgba(31, 41, 55, 0.1)',
    '0px 26px 30px rgba(31, 41, 55, 0.1)',
    '0px 28px 32px rgba(31, 41, 55, 0.1)',
    '0px 30px 34px rgba(31, 41, 55, 0.1)',
    '0px 32px 36px rgba(31, 41, 55, 0.1)',
    '0px 34px 38px rgba(31, 41, 55, 0.1)',
    '0px 36px 40px rgba(31, 41, 55, 0.1)',
    '0px 38px 42px rgba(31, 41, 55, 0.1)',
    '0px 40px 44px rgba(31, 41, 55, 0.1)',
    '0px 42px 46px rgba(31, 41, 55, 0.1)',
    '0px 44px 48px rgba(31, 41, 55, 0.1)',
    '0px 46px 50px rgba(31, 41, 55, 0.1)',
  ],
});

export default theme;
