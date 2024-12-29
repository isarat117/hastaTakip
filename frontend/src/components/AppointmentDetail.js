import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Image } from 'lucide-react';
import './AppointmentDetail.css';
import { BASE_URL } from '../config/config';

const AppointmentDetail = () => {
  const { tcNumber, appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [radiographs, setRadiographs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointmentDetails = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${appointmentId}`);
      if (!response.ok) {
        throw new Error('Randevu detayları alınamadı');
      }
      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      setError('Randevu detayları yüklenirken bir hata oluştu');
    }
  }, [appointmentId]);

  const fetchRadiographs = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${appointmentId}/radiographs`);
      if (!response.ok) {
        throw new Error('Görüntüler alınamadı');
      }
      const data = await response.json();
      setRadiographs(data);
    } catch (error) {
      setError('Görüntüler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    Promise.all([fetchAppointmentDetails(), fetchRadiographs()]);
  }, [fetchAppointmentDetails, fetchRadiographs]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!appointment) return <div className="error">Randevu bulunamadı</div>;

  return (
    <div className="appointment-detail">
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <button className="button back" onClick={() => navigate(`/patients/${tcNumber}`)}>
              <ArrowLeft className="icon" />
              Geri
            </button>
            <h2>Randevu Detayı</h2>
          </div>
          <button
            className="button primary"
            onClick={() => navigate(`/patients/${tcNumber}/radiographs/new?appointmentId=${appointmentId}`)}
          >
            <Plus className="icon" />
            Görüntü Ekle
          </button>
        </div>

        <div className="card-content">
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Tarih:</span>
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Saat:</span>
              <span>{formatTime(appointment.date)}</span>
            </div>
            <div className="info-item">
              <span className="label">Neden:</span>
              <span>{appointment.reason}</span>
            </div>
            <div className="info-item">
              <span className="label">Diş Numaraları:</span>
              <span>{appointment.toothNumbers?.join(', ') || '-'}</span>
            </div>
            <div className="info-item">
              <span className="label">Maliyet:</span>
              <span>{formatCurrency(appointment.cost)}</span>
            </div>
            {appointment.notes && (
              <div className="info-item full-width">
                <span className="label">Notlar:</span>
                <span>{appointment.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Radyolojik Görüntüler</h2>
        </div>
        <div className="card-content">
          {radiographs.length === 0 ? (
            <div className="no-records">Görüntü bulunmamaktadır</div>
          ) : (
            <div className="radiographs-grid">
              {radiographs.map((radiograph) => (
                <div
                  key={radiograph.id}
                  className="radiograph-card"
                  onClick={() => navigate(`/patients/${tcNumber}/radiographs/${radiograph.id}`)}
                >
                  <div className="radiograph-image">
                    <img src={`${BASE_URL.replace('/api', '')}${radiograph.imagePath}`} alt={`Diş ${radiograph.toothNumber}`} />
                  </div>
                  <div className="radiograph-info">
                    <div className="info-row">
                      <span className="label">Diş No:</span>
                      <span>{radiograph.toothNumber}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Tip:</span>
                      <span>{radiograph.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail; 