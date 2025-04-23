import {Routes, Route, BrowserRouter} from 'react-router-dom';
import { MainPage } from './pages/Mainpages';
import { Login } from './pages/Loginpages/login';
import { About } from './pages/AboutPage/about';
import { Abitur } from './pages/AbiturPage/abitur';
import { Stud } from './pages/StudPage/stud';
import { Museum } from './pages/MuseumPage/museum';
import { Lifeinst } from './pages/LifeInstPage/lifeinst';
import { Layout } from './layout/index';


export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout/>}>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />}/>
          <Route path='/about' element={<About />}/>
          <Route path='/abitur' element={<Abitur />}/>
          <Route path='/stud' element={<Stud/>}/>
          <Route path='/lifeinst' element={<Lifeinst/>}/>
          <Route path='/museum' element={<Museum/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
