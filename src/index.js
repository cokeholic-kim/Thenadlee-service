import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, legacy_createStore as createStore } from 'redux';
import rooterReducer from './modules';
import { composeWithDevTools } from '@redux-devtools/extension';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import PwaNotices from './pwa/PwaNotices';
import SessionExpiredNotice from './session/SessionExpiredNotice';
import { installSessionExpiryHandler } from './session/sessionExpiry';

const store = createStore(rooterReducer,composeWithDevTools(applyMiddleware(thunk)))
installSessionExpiryHandler(store);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter basename={process.env.PUBLIC_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Provider store={store}>
        <App />
        <PwaNotices />
        <SessionExpiredNotice />
      </Provider>
    </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
