import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import './AddAppointment.css';
import { BASE_URL } from '../config/config';

const AddAppointment = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    reason: '',
    cost: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Tarih ve saat birleştirme
    const appointmentDateTime = new Date(appointment.date + 'T' + appointment.time);
    const now = new Date();

    if (appointmentDateTime < now) {
      setError('Geçmiş bir tarih için randevu oluşturulamaz');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/patients/${tcNumber}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointment,
          date: appointmentDateTime.toISOString(),
          cost: parseFloat(appointment.cost) || 0
        }),
      });

      if (!response.ok) {
        throw new Error('Randevu eklenirken bir hata oluştu');
      }

      navigate(`/patients/${tcNumber}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const today = new Date().toISOString().split('T')[0];

  const timeSlots = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute of ['00', '30']) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute}`);
    }
  }

  return (
    <div className="appointment-form">
      <div className="form-header">
        <button className="button secondary" onClick={() => navigate(`/patients/${tcNumber}`)}>
          <ArrowLeft size={18} />
          Geri
        </button>
        <h2>Yeni Randevu Ekle</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group date-group">
            <label htmlFor="date">Tarih*</label>
            <input
              type="date"
              id="date"
              name="date"
              value={appointment.date}
              onChange={handleChange}
              min={today}
              required
            />
          </div>

          <div className="form-group time-group">
            <label htmlFor="time">Saat*</label>
            <select
              id="time"
              name="time"
              value={appointment.time}
              onChange={handleChange}
              required
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reason">Randevu Nedeni*</label>
          <input
            type="text"
            id="reason"
            name="reason"
            value={appointment.reason}
            onChange={handleChange}
            required
            placeholder="Randevu nedenini giriniz"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cost">Ücret (TL)*</label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={appointment.cost}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notlar</label>
          <textarea
            id="notes"
            name="notes"
            value={appointment.notes}
            onChange={handleChange}
            placeholder="Varsa notlarınızı giriniz"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="button secondary" onClick={() => navigate(`/patients/${tcNumber}`)}>
            İptal
          </button>
          <button type="submit" className="button primary">
            Randevu Ekle
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppointment; 