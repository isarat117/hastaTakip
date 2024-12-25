// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import AddPatient from './components/AddPatient';
import EditPatient from './components/EditPatient';
import AddAppointment from './components/AddAppointment';
import AddPayment from './components/AddPayment';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PatientList />} />
        <Route path="/patients/:tcNumber" element={<PatientDetails />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/edit-patient/:tcNumber" element={<EditPatient />} />
        <Route path="/patients/:tcNumber/new-appointment" element={<AddAppointment />} />
        <Route path="/patients/:tcNumber/new-payment" element={<AddPayment />} />
      </Routes>
    </Router>
  );
};

export default App;