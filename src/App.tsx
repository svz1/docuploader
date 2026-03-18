import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from "./AdminDashboard";
import Form from "./form";
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
          <Route path="/form" element={<Form />} />
          <Route path="/sign-offer" element={<SignOffer />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;