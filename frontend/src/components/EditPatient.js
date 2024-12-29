import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import './EditPatient.css';
import { BASE_URL } from '../config/config';

const EditPatient = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState({
    tcNumber: '',
    name: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`${BASE_URL}/patients/${tcNumber}`);
        if (!response.ok) {
          throw new Error('Hasta bulunamadı');
        }
        const data = await response.json();
        setPatient({
          tcNumber: data.tcNumber,
          name: data.name,
          phoneNumber: data.phoneNumber
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [tcNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/patients/${tcNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patient),
      });

      if (!response.ok) {
        throw new Error('Hasta güncellenirken bir hata oluştu');
      }

      navigate(`/patients/${tcNumber}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-patient">
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <button className="button back" onClick={() => navigate(`/patients/${tcNumber}`)}>
              <ArrowLeft className="icon" />
              Geri
            </button>
            <h2>Hasta Düzenle</h2>
          </div>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tcNumber">T.C. Kimlik No</label>
              <input
                type="text"
                id="tcNumber"
                name="tcNumber"
                value={patient.tcNumber}
                onChange={handleChange}
                disabled
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Ad Soyad</label>
              <input
                type="text"
                id="name"
                name="name"
                value={patient.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Telefon Numarası</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={patient.phoneNumber}
                onChange={handleChange}
                required
                className="form-control"
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

export default EditPatient; 