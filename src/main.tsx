import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { DeckProvider } from './store/DeckProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DeckProvider>
      <App />
    </DeckProvider>
  </StrictMode>,
)
