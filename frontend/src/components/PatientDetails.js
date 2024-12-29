import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, CreditCard, Image, User, FileText } from 'lucide-react';
import './PatientDetails.css';
import { BASE_URL } from '../config/config';

const PatientDetails = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${BASE_URL}/patients/${tcNumber}`);
        if (!response.ok) {
          throw new Error('Hasta bilgileri alınamadı');
        }
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        console.error('Hasta detayları getirilirken hata oluştu:', error);
      }
    };

    fetchPatient();
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
        const response = await fetch(`${BASE_URL}/patients/${tcNumber}`, {
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
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
        );

      case 'appointments':
        return (
          <>
            <div className="tab-header">
              <h3>Randevular</h3>
              <button className="button primary" onClick={() => navigate(`/patients/${tcNumber}/new-appointment`)}>
                <Calendar className="icon" />
                Yeni Randevu
              </button>
            </div>
            <div className="table">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">Tarih</div>
                  <div className="table-cell">Diş Numaraları</div>
                  <div className="table-cell">Neden</div>
                  <div className="table-cell">Maliyet</div>
                  <div className="table-cell">Notlar</div>
                </div>
              </div>
              <div className="table-body">
                {(patient.appointments || []).length === 0 ? (
                  <div className="table-row">
                    <div className="table-cell empty" colSpan="5">
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
                      <div className="table-cell" data-label="Tarih">{formatDate(appointment.date)}</div>
                      <div className="table-cell" data-label="Diş Numaraları">
                        {appointment.toothNumbers?.join(', ') || '-'}
                      </div>
                      <div className="table-cell" data-label="Neden">{appointment.reason}</div>
                      <div className="table-cell" data-label="Maliyet">{formatCurrency(appointment.cost)}</div>
                      <div className="table-cell" data-label="Notlar">{appointment.notes}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );

      case 'payments':
        return (
          <>
            <div className="tab-header">
              <h3>Ödemeler</h3>
              <button className="button primary" onClick={() => navigate(`/patients/${tcNumber}/new-payment`)}>
                <CreditCard className="icon" />
                Ödeme Ekle
              </button>
            </div>
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
                      <div className="table-cell" data-label="Tarih">{formatDate(payment.date)}</div>
                      <div className="table-cell" data-label="Miktar">{formatCurrency(payment.amount)}</div>
                      <div className="table-cell" data-label="Notlar">{payment.notes}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );

      case 'radiographs':
        return (
          <>
            <div className="tab-header">
              <h3>Radyolojik Görüntüler</h3>
              <button className="button primary" onClick={() => navigate(`/patients/${tcNumber}/radiographs`)}>
                <Image className="icon" />
                Görüntü Ekle
              </button>
            </div>
            <div className="radiographs-grid">
              {(patient.radiographs || []).length === 0 ? (
                <div className="empty-state">Henüz görüntü eklenmemiş</div>
              ) : (
                patient.radiographs.map((radiograph) => (
                  <div key={radiograph.id} className="radiograph-item">
                    <img src={radiograph.imageUrl} alt={`Radyografi ${formatDate(radiograph.date)}`} />
                    <div className="radiograph-info">
                      <span className="date">{formatDate(radiograph.date)}</span>
                      <span className="tooth-number">{radiograph.toothNumber ? `Diş ${radiograph.toothNumber}` : 'Genel'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      default:
        return null;
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
            <div className="patient-title">
              <h2>Hasta Bilgileri</h2>
              <h1 className="patient-name">{patient.name}</h1>
            </div>
          </div>
          <div className="button-group">
            <button className="button edit" onClick={() => navigate(`/edit-patient/${tcNumber}`)}>
              <Edit className="icon" />
              Düzenle
            </button>
            <button className="button delete" onClick={handleDelete}>
              <Trash2 className="icon" />
              Sil
            </button>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <User className="icon" />
            Kişisel Bilgiler
          </button>
          <button
            className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <Calendar className="icon" />
            Randevular
          </button>
          <button
            className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard className="icon" />
            Ödemeler
          </button>
          <button
            className={`tab ${activeTab === 'radiographs' ? 'active' : ''}`}
            onClick={() => setActiveTab('radiographs')}
          >
            <Image className="icon" />
            Görüntüler
          </button>
        </div>

        <div className="card-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
