import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="1091616824041-4fare23gftddcbqet5siapokfdiqenk1.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
)
