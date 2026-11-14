import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Rejestracja Service Workera dla pełnego wsparcia trybu offline i instalacji PWA
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] Dostępna nowa wersja Kreatora Zabudów Nowa Firma');
  },
  onOfflineReady() {
    console.log('[PWA] Aplikacja zaindeksowana do pracy w trybie offline');
  },
  onRegisterError(error) {
    console.warn('[PWA] Błąd rejestracji Service Workera:', error);
  }
});

createRoot(document.getElementById('root')!).render(<App />);
