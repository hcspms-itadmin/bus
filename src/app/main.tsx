import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/globals.css'
import { EtaProvider } from './providers/EtaProvider'
import { Board } from '../features/board/Board'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <EtaProvider>
      <Board />
    </EtaProvider>
  </StrictMode>,
)