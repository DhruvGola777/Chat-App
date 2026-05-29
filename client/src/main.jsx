import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from './hooks/AppContext.jsx'
import { ChatProvider } from './hooks/ChatContext.jsx'
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <ChatProvider>
    <App />
    </ChatProvider>
  </AuthProvider>
  </BrowserRouter>
)
