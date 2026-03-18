import "./App.css";
import Form from "./form";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Offer from "./offer";
import AdminDashboard from "./AdminDashboard";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import SignOffer from "./signOffer";
import PortalLayout from "./PortalLayout";
import ThankYou from "./ThankYou";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PortalLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/form" element={<Form />} />
          <Route path="/success" element={<Offer />} />
          <Route path="/sign-offer" element={<SignOffer />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;