import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import './PatientList.css';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortByDate, setSortByDate] = useState(true); // Varsayılan olarak tarihe göre sıralama aktif
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/patients');
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getUpcomingAppointment = (patient) => {
    const now = new Date();
    const futureAppointments = patient.appointments
      ?.filter(apt => new Date(apt.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return futureAppointments?.[0]?.date || null;
  };

  const calculateBalance = (patient) => {
    const totalCost = (patient.appointments || []).reduce(
      (sum, apt) => sum + (apt.cost || 0),
      0
    );
    const totalPaid = (patient.payments || []).reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    return totalCost - totalPaid;
  };

  // Hastaları sırala
  const sortedPatients = [...patients].sort((a, b) => {
    if (sortByDate) {
      const dateA = getUpcomingAppointment(a) || '9999-12-31';
      const dateB = getUpcomingAppointment(b) || '9999-12-31';
      return new Date(dateA) - new Date(dateB);
    }
    return 0;
  });

  // Arama terimine göre hastaları filtreleme
  const filteredPatients = sortedPatients.filter(patient => 
    patient.tcNumber.includes(searchTerm) || 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    patient.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="patient-list">
      <div className="list-card">
        <div className="list-header">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="TC No, İsim, Telefon No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="add-button" onClick={() => navigate('/add-patient')}>
            <PlusCircle className="icon" />
            Yeni Hasta Ekle
          </button>
        </div>
        <div className="list-content">
          {filteredPatients.length > 0 ? (
            <div className="list-table">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">TC No</div>
                  <div className="table-cell">Hasta Adı</div>
                  <div className="table-cell">Telefon Numarası</div>
                  <div className="table-cell">Kayıt Tarihi</div>
                  <div className="table-cell" onClick={() => setSortByDate(!sortByDate)} style={{ cursor: 'pointer' }}>
                    <div className="cell-with-icon">
                      Sonraki Randevu
                      <ArrowUpDown className="sort-icon" size={16} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="table-body">
                {filteredPatients.map((patient) => {
                  const nextAppointment = getUpcomingAppointment(patient);
                  const hasDebt = calculateBalance(patient) > 0;

                  return (
                    <div
                      key={patient.tcNumber}
                      className="table-row clickable"
                      onClick={() => navigate(`/patients/${patient.tcNumber}`)}
                    >
                      <div className="table-cell">{patient.tcNumber}</div>
                      <div className={`table-cell ${hasDebt ? 'text-red' : ''}`}>
                        {patient.name}
                      </div>
                      <div className="table-cell">{patient.phoneNumber}</div>
                      <div className="table-cell">{formatDate(patient.registrationDate)}</div>
                      <div className="table-cell">
                        {nextAppointment ? formatDate(nextAppointment) : '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-records">Kayıt Bulunamadı</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
