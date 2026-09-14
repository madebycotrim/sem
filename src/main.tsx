import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import { ProvedorModalUniversal } from './componentes/ModalUniversal.tsx';

// Limpeza de segurança: nenhuma informação clínica, de fila ou de atendimentos deve persistir localmente no navegador (LGPD e consistência com o banco)
try {
  localStorage.clear();
  sessionStorage.clear();
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProvedorModalUniversal>
      <App />
    </ProvedorModalUniversal>
  </StrictMode>
);
