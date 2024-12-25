import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import './PatientDetails.css';
import { useParams, useNavigate } from 'react-router-dom';

const PatientDetails = () => {
  const {tcNumber}= useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    console.log(tcNumber)
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}`);
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error('Hasta detayları getirilirken hata oluştu:', error);
      }
    };

    fetchPatientDetails();
  }, [tcNumber]);

  const calculateBalance = () => {
    if (!patient) return 0;

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (!patient) return <div className="loading">Yükleniyor...</div>;

  return (
    <div className="patient-details">
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <button className="button back" onClick={() => navigate('/')}>
              <ArrowLeft className="icon" />
              Geri
            </button>
            <h2>Hasta Bilgileri</h2>
          </div>
          <div className="button-group">
            <button
              className="button edit"
              onClick={() => navigate(`/edit-patient/${tcNumber}`)}
            >
              <Edit className="icon" />
              Düzenle
            </button>
            
            <button className="button delete" onClick={async () => {
              if(window.confirm('Bu hastayı silmek istediğinizden emin misiniz?')) {
                try {
                  const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}`, {
                    method: 'DELETE'
                  });
                  
                  if (!response.ok) {
                    throw new Error('Hasta silinirken bir hata oluştu');
                  }
                  
                  navigate('/');
                } catch (error) {
                  console.error('Silme hatası:', error);
                  alert('Hasta silinirken bir hata oluştu');
                }
              }
            }}>
              <Trash2 className="icon" />
              Sil
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="info-grid">
            <div className="info-item">
              <p className="label">T.C. Numarası</p>
              <p className="value">{patient.tcNumber}</p>
            </div>
            <div className="info-item">
              <p className="label">Adı</p>
              <p className="value">{patient.name}</p>
            </div>
            <div className="info-item">
              <p className="label">Telefon Numarası</p>
              <p className="value">{patient.phoneNumber}</p>
            </div>
            <div className="info-item">
              <p className="label">Kayıt Tarihi</p>
              <p className="value">{formatDate(patient.registrationDate)}</p>
            </div>
            <div className="info-item">
              <p className="label">Toplam Maliyet</p>
              <p className="value">
                {formatCurrency(
                  (patient.appointments || []).reduce((sum, apt) => sum + (apt.cost || 0), 0)
                )}
              </p>
            </div>
            <div className="info-item">
              <p className="label">Bakiye</p>
              <p
                className={`value ${
                  calculateBalance() > 0 ? 'negative' : 'positive'
                }`}
              >
                {formatCurrency(calculateBalance())}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Randevular</h2>
          <button className="button primary" onClick={() => navigate(`/patients/${tcNumber}/new-appointment`)}>
            <Calendar className="icon" />
            Yeni Randevu
          </button>
        </div>
        <div className="card-content">
          <div className="table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Tarih</div>
                <div className="table-cell">Neden</div>
                <div className="table-cell">Maliyet</div>
                <div className="table-cell">Notlar</div>
              </div>
            </div>
            <div className="table-body">
              {(patient.appointments || []).map((appointment) => (
                <div key={appointment.id} className="table-row">
                  <div className="table-cell">{formatDate(appointment.date)}</div>
                  <div className="table-cell">{appointment.reason}</div>
                  <div className="table-cell">{formatCurrency(appointment.cost)}</div>
                  <div className="table-cell">{appointment.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Ödemeler</h2>
          <button className="button primary" onClick={() => navigate(`/patients/${tcNumber}/new-payment`)}>
            <CreditCard className="icon" />
            Ödeme Ekle
          </button>
        </div>
        <div className="card-content">
          <div className="table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Tarih</div>
                <div className="table-cell">Miktar</div>
                <div className="table-cell">Notlar</div>
              </div>
            </div>
            <div className="table-body">
              {(patient.payments || []).map((payment) => (
                <div key={payment.id} className="table-row">
                  <div className="table-cell">{formatDate(payment.date)}</div>
                  <div className="table-cell">{formatCurrency(payment.amount)}</div>
                  <div className="table-cell">{payment.notes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
