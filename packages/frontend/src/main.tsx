import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { ProvedorModalUniversal } from './componentes/ModalUniversal.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorModalUniversal>
      <App />
    </ProvedorModalUniversal>
  </StrictMode>
);
