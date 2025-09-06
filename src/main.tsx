
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from "@/components/ui/toaster";

const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>
);
