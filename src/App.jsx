import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import Hero from "./components/hero";
import Catalog from "./components/catalog";
import Contact from "./components/contact";
import Login from "./components/login";
import Admin from "./components/admin";
import Reservation from "./components/reservation";
import RequireAuth from "./components/RequireAuth";
import Equipment from "./components/equipment";
import Clients from "./components/clients";
import ReservationAdmin from "./components/reservationAdmin";
import Footer from "./components/footer"

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <>
          <Header />
          <Hero />
          <Catalog />
          <Reservation />
          <Contact />
          <Footer />
        </>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={
        <RequireAuth>
          <Admin />
        </RequireAuth>
      } />
      <Route path="/equipment" element={
        <RequireAuth>
          <Equipment />
        </RequireAuth>
      } />
      <Route path="/reservation" element={
        <RequireAuth>
          <ReservationAdmin />
        </RequireAuth>
      } />
      <Route path="/clients" element={
        <RequireAuth>
          <Clients />
        </RequireAuth>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;