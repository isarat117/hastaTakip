import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import './AddPayment.css';
import { BASE_URL } from '../config/config';

const AddPayment = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState({
    amount: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/patients/${tcNumber}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payment,
          amount: parseFloat(payment.amount) || 0
        }),
      });

      if (!response.ok) {
        throw new Error('Ödeme eklenirken bir hata oluştu');
      }

      navigate(`/patients/${tcNumber}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="add-payment">
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <button className="button back" onClick={() => navigate(`/patients/${tcNumber}`)}>
              <ArrowLeft className="icon" />
              Geri
            </button>
            <h2>Yeni Ödeme Ekle</h2>
          </div>
        </div>
        <div className="card-content">
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Ödeme Tutarı (TL)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={payment.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notlar</label>
              <textarea
                id="notes"
                name="notes"
                value={payment.notes}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Varsa notlarınızı giriniz"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="button secondary" onClick={() => navigate(`/patients/${tcNumber}`)}>
                İptal
              </button>
              <button type="submit" className="button primary">
                <Save className="icon" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPayment; 