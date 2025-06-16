import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { MainPage } from './pages/Mainpages';
import { Login } from './pages/Loginpages/login';
import { About } from './pages/AboutPage/about';
import { Abitur } from './pages/AbiturPage/abitur';
import { Stud } from './pages/StudPage/stud';
import { Museum } from './pages/MuseumPage/museum';
import { Lifeinst } from './pages/LifeInstPage/lifeinst';
import { Layout } from './layout/index';
import { PersonalAccount } from './pages/PersonalAccount/PersonalAccount';
import { Statements } from './pages/StatementsPage/State/statements';
import { Adminstatements } from './pages/StatementsPage/AdminState/adminstatements';
import { Adminpanel } from './pages/AdminPanelPage/adminpanel';
import { Assistant } from './pages/Assistant/assistant';
import { Documents } from './pages/AboutPage/Document/documents';
import { VKCallbackPage } from './pages/Loginpages/VK/VKCallbackPage';
import { VKAuthHandler } from './Context/VKContext';
import { AuthProvider } from './Context/AuthContext';


export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VKAuthHandler>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<Login />} />
              <Route path='/about' element={<About />} />
              <Route path='/abitur' element={<Abitur />} />
              <Route path='/stud' element={<Stud />} />
              <Route path='/lifeinst' element={<Lifeinst />} />
              <Route path='/museum' element={<Museum />} />
              <Route path='/personalaccount' element={<PersonalAccount />} />
              <Route path='/statements' element={<Statements />} />
              <Route path='/adminstatements' element={<Adminstatements />} />
              <Route path='/adminpanel' element={<Adminpanel />} />
              <Route path='/assistant' element={<Assistant />} />
              <Route path='/documents' element={<Documents />} />
              <Route path="/auth/vk/callback" element={<VKCallbackPage />} />
            </Route>
          </Routes>
        </VKAuthHandler>
      </AuthProvider>
    </BrowserRouter>
  );
}
