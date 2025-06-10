import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
          <AppRoutes />
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
};

export default App;