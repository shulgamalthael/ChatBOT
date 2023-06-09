/* react */
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";

/* components */
import App from './components/App';

/* scripts */
import initAxios from './api/axios';

/* stylesheet */
import './index.css';
import './assets/fonts/wl-icons/IconFont.css';

const root = ReactDOM.createRoot(document.getElementById('chatroot'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

initAxios();
