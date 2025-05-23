import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RandomLocationGenerator from './RandomLocationGenerator';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RandomLocationGenerator />
  </React.StrictMode>
);