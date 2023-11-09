import React from 'react';
import ReactDOM from 'react-dom/client';

import QueryClientHolder from './QueryClientHolder';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>    
    <QueryClientHolder />
  </React.StrictMode>,
)
