import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' // <--- MAKE SURE THIS IS HERE
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
