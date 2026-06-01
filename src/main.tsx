import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AchievementsProvider } from './context/AchievementsContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AchievementsProvider>
      <App />
    </AchievementsProvider>
  </StrictMode>,
);
