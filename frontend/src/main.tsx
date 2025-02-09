import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router';
import 'material-icons/iconfont/material-icons.css';
import { Provider } from 'react-redux';
import store from './store/store.ts';
import { WSConnectorContextProvider } from '@/contexts/WSConnector/WSConnectorContext';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Provider store={store}>
      <WSConnectorContextProvider>
        <App />
      </WSConnectorContextProvider>
    </Provider>
  </BrowserRouter>,
);
