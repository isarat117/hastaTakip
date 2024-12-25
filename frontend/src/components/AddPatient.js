// AddPatient.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPatient.css';

const AddPatient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tcNumber: '',
    name: '',
    phoneNumber: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Hasta eklenirken hata oluştu:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="add-patient">
      <div className="form-card">
        <div className="form-header">
          <h2>Yeni Hasta Ekle</h2>
        </div>
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="tcNumber">T.C. Numarası</label>
            <input
              type="text"
              id="tcNumber"
              name="tcNumber"
              value={formData.tcNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Hasta Adı</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Telefon Numarası</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="button" className="button secondary" onClick={() => navigate('/')}>
              İptal
            </button>
            <button type="submit" className="button primary">
              Hastayı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;