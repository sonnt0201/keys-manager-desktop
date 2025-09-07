import React from 'react'
import ReactDOM from 'react-dom/client'


import './index.css'

import './demos/ipc'
import App from './renderer/App'
import { ThemeProvider, CssBaseline } from '@mui/material';
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { darkTheme } from './renderer/theme'


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline /> {/* Normalizes styles for dark mode */}

      <App />
    </ThemeProvider>

  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
