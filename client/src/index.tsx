declare global {
  interface Window {
    http2: any;
  }
}

import http2 from './http2Polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from 'serviceWorker';

// Ensure the polyfill is applied
if (typeof window !== 'undefined' && !window.http2) {
  window.http2 = http2;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();