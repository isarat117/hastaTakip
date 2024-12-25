// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PatientList from './components/PatientList';
import AddPatient from './components/AddPatient';
import PatientDetails from './components/PatientDetails';
import EditPatient from './components/EditPatient';
import AddAppointment from './components/AddAppointment';
import AddPayment from './components/AddPayment';
import RadiologicalImages from './components/RadiologicalImages';
import RadiologicalImageDetail from './components/RadiologicalImageDetail';
import AddRadiograph from './components/AddRadiograph';
import FinancialSummary from './components/FinancialSummary';
import AppointmentDetail from './components/AppointmentDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<PatientList />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patients/:tcNumber" element={<PatientDetails />} />
          <Route path="/edit-patient/:tcNumber" element={<EditPatient />} />
          <Route path="/patients/:tcNumber/new-appointment" element={<AddAppointment />} />
          <Route path="/patients/:tcNumber/new-payment" element={<AddPayment />} />
          <Route path="/patients/:tcNumber/radiographs" element={<RadiologicalImages />} />
          <Route path="/patients/:tcNumber/radiographs/new" element={<AddRadiograph />} />
          <Route path="/patients/:tcNumber/radiographs/:imageId" element={<RadiologicalImageDetail />} />
          <Route path="/patients/:tcNumber/appointments/:appointmentId" element={<AppointmentDetail />} />
          <Route path="/financial-summary" element={<FinancialSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;