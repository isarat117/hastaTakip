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
  const [errors, setErrors] = useState({
    tcNumber: '',
    name: '',
    phoneNumber: ''
  });

  // TC Kimlik Numarası Doğrulama Fonksiyonu
  const validateTCNumber = (value) => {
    // 11 haneli olmalı ve sadece rakamlardan oluşmalı
    if (!/^\d{11}$/.test(value)) {
      return 'TC Kimlik numarası 11 haneli olmalı ve sadece rakamlardan oluşmalıdır';
    }

    // İlk rakam 0 olamaz
    if (value[0] === '0') {
      return 'TC Kimlik numarası 0 ile başlayamaz';
    }

    // Algoritma kontrolü
    const digits = value.split('').map(Number);
    
    // 1, 3, 5, 7 ve 9. hanelerin toplamı
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    
    // 2, 4, 6 ve 8. hanelerin toplamı
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    
    // 10. hane kontrolü
    const digit10 = (oddSum * 7 - evenSum) % 10;
    if (digit10 !== digits[9]) {
      return 'Geçersiz TC Kimlik numarası';
    }
    
    // 11. hane kontrolü
    const sum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
    const digit11 = sum % 10;
    if (digit11 !== digits[10]) {
      return 'Geçersiz TC Kimlik numarası';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // TC Kimlik numarası doğrulama
    const tcError = validateTCNumber(formData.tcNumber);
    if (tcError) {
      setErrors(prev => ({ ...prev, tcNumber: tcError }));
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Hasta eklenirken bir hata oluştu');
      }

      navigate('/');
    } catch (error) {
      console.error('Hasta eklenirken hata oluştu:', error);
      alert('Hasta eklenirken bir hata oluştu');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // TC Kimlik numarası değiştiğinde anında doğrulama
    if (name === 'tcNumber') {
      if (value.length === 11) {
        const error = validateTCNumber(value);
        setErrors(prev => ({ ...prev, tcNumber: error }));
      } else {
        setErrors(prev => ({ ...prev, tcNumber: '' }));
      }
    }
  };

  return (
    <div className="add-patient">
      <div className="form-card">
        <div className="form-header">
          <h2>Yeni Hasta Ekle</h2>
        </div>
        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="tcNumber">T.C. Kimlik Numarası</label>
            <input
              type="text"
              id="tcNumber"
              name="tcNumber"
              value={formData.tcNumber}
              onChange={handleChange}
              maxLength="11"
              pattern="\d*"
              required
              className={errors.tcNumber ? 'error' : ''}
            />
            {errors.tcNumber && (
              <div className="error-message">{errors.tcNumber}</div>
            )}
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
            <button 
              type="submit" 
              className="button primary"
              disabled={!!errors.tcNumber}
            >
              Hastayı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;