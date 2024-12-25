import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, CreditCard, Image } from 'lucide-react';
import './PatientDetails.css';

const PatientDetails = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}`);
        if (!response.ok) {
          throw new Error('Hasta bilgileri alınamadı');
        }
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const handleDelete = async () => {
    if (window.confirm('Bu hastayı silmek istediğinizden emin misiniz?')) {
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
              className="button primary"
              onClick={() => navigate(`/patients/${tcNumber}/radiographs`)}
            >
              <Image className="icon" />
              Radyolojik Görüntüler
            </button>
            <button
              className="button edit"
              onClick={() => navigate(`/edit-patient/${tcNumber}`)}
            >
              <Edit className="icon" />
              Düzenle
            </button>
            <button className="button delete" onClick={handleDelete}>
              <Trash2 className="icon" />
              Sil
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">T.C. Kimlik No:</span>
              <span>{patient.tcNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Ad Soyad:</span>
              <span>{patient.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Telefon:</span>
              <span>{patient.phoneNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Kayıt Tarihi:</span>
              <span>{formatDate(patient.registrationDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Bakiye:</span>
              <span className={calculateBalance() > 0 ? 'text-red' : 'text-green'}>
                {formatCurrency(calculateBalance())}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Randevular</h2>
          <button 
            className="button primary" 
            onClick={() => navigate(`/patients/${tcNumber}/new-appointment`)}
          >
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
              {(patient.appointments || []).length === 0 ? (
                <div className="table-row">
                  <div className="table-cell empty" colSpan="4">
                    Randevu bulunmamaktadır
                  </div>
                </div>
              ) : (
                patient.appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="table-row clickable"
                    onClick={() => navigate(`/patients/${tcNumber}/appointments/${appointment.id}`)}
                  >
                    <div className="table-cell">{formatDate(appointment.date)}</div>
                    <div className="table-cell">{appointment.reason}</div>
                    <div className="table-cell">{formatCurrency(appointment.cost)}</div>
                    <div className="table-cell">{appointment.notes}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Ödemeler</h2>
          <button 
            className="button primary" 
            onClick={() => navigate(`/patients/${tcNumber}/new-payment`)}
          >
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
              {(patient.payments || []).length === 0 ? (
                <div className="table-row">
                  <div className="table-cell empty" colSpan="3">
                    Ödeme bulunmamaktadır
                  </div>
                </div>
              ) : (
                patient.payments.map((payment) => (
                  <div key={payment.id} className="table-row">
                    <div className="table-cell">{formatDate(payment.date)}</div>
                    <div className="table-cell">{formatCurrency(payment.amount)}</div>
                    <div className="table-cell">{payment.notes}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
