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

export default function() {
  if(document && document.head) {
    const script = document.createElement("script");
    script.src = "../main.js";

    document.head.append(script);
  }
}

initAxios();
