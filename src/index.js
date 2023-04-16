import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Test from './pages/Test'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
     <Routes>
       <Route path = '/' element = {<App/>} /> 
       <Route path = '/Login' element = {<Login/>} />
       <Route path = '/Home' element = {<Home/>} />
       <Route path = '/Test' element = {<Test/>} />
     </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
