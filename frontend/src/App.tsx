import {Routes, Route, BrowserRouter} from 'react-router-dom';
import { MainPage } from './pages/Mainpages';
import { Login } from './pages/login';


export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} /> {/* Путь для авторизации */}
      </Routes>
    </BrowserRouter>
  );
}
