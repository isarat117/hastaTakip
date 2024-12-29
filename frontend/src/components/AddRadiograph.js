import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import './AddRadiograph.css';
import { BASE_URL } from '../config/config';

const AddRadiograph = () => {
  const navigate = useNavigate();
  const { tcNumber } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const appointmentId = searchParams.get('appointmentId');
  const [appointments, setAppointments] = useState([]);
  const [teethNotes, setTeethNotes] = useState({});

  const [formData, setFormData] = useState({
    toothNumber: '',
    type: '',
    notes: '',
    diagnosis: '',
    image: null,
    appointmentId: appointmentId || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hasta bilgilerini ve randevuları getir
        const patientResponse = await fetch(`${BASE_URL}/patients/${tcNumber}`);
        if (!patientResponse.ok) {
          throw new Error('Hasta bilgileri alınamadı');
        }
        const patientData = await patientResponse.json();
        setAppointments(patientData.appointments || []);

        // Diş notlarını getir
        const notesResponse = await fetch(`${BASE_URL}/patients/${tcNumber}/teeth/notes`);
        if (!notesResponse.ok) {
          throw new Error('Diş notları alınamadı');
        }
        const notesData = await notesResponse.json();
        setTeethNotes(notesData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
      }
    };

    fetchData();
  }, [tcNumber]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Lütfen geçerli bir görüntü dosyası seçin');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.image) {
      setError('Lütfen bir görüntü seçin');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', formData.image);
      formDataToSend.append('toothNumber', formData.toothNumber);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('notes', formData.notes);
      formDataToSend.append('diagnosis', formData.diagnosis);
      
      if (formData.appointmentId) {
        formDataToSend.append('appointmentId', formData.appointmentId);
      }

      const response = await fetch(`${BASE_URL}/patients/${tcNumber}/radiographs`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Görüntü yüklenirken bir hata oluştu');
      }

      if (formData.appointmentId) {
        navigate(`/patients/${tcNumber}/appointments/${formData.appointmentId}`);
      } else {
        navigate(`/patients/${tcNumber}/radiographs`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + 
           date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const getToothColor = (toothNumber) => {
    if (toothNumber.toString() === formData.toothNumber) return 'yellow';
    return teethNotes[toothNumber] ? 'green' : 'transparent';
  };

  const handleToothClick = (number) => {
    setFormData(prev => ({ ...prev, toothNumber: number.toString() }));
  };

  const renderTeethGrid = () => {
    // Üst çene (18-11, 21-28)
    const upperTeeth = [
      18, 17, 16, 15, 14, 13, 12, 11,
      21, 22, 23, 24, 25, 26, 27, 28
    ];
    
    // Alt çene (48-41, 31-38)
    const lowerTeeth = [
      48, 47, 46, 45, 44, 43, 42, 41,
      31, 32, 33, 34, 35, 36, 37, 38
    ];

    return (
      <div className="teeth-grid">
        <div className="teeth-row">
          {upperTeeth.map(number => (
            <div
              key={number}
              className={`tooth ${number.toString() === formData.toothNumber ? 'selected' : ''}`}
              style={{ backgroundColor: getToothColor(number) }}
              title={teethNotes[number]?.length > 0 ? `${teethNotes[number].length} not var` : ''}
              onClick={() => handleToothClick(number)}
            >
              {number}
            </div>
          ))}
        </div>
        <div className="teeth-row">
          {lowerTeeth.map(number => (
            <div
              key={number}
              className={`tooth ${number.toString() === formData.toothNumber ? 'selected' : ''}`}
              style={{ backgroundColor: getToothColor(number) }}
              title={teethNotes[number]?.length > 0 ? `${teethNotes[number].length} not var` : ''}
              onClick={() => handleToothClick(number)}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="button back" onClick={() => navigate(-1)}>
          <ArrowLeft className="icon" />
          Geri
        </button>
        <h2>Radyolojik Görüntü Ekle</h2>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="image-upload-section">
          <label htmlFor="image" className="file-input-label">
            <Upload className="icon" />
            Görüntü Seç
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {!imagePreview && (
            <div className="upload-text">
              <ImageIcon className="icon" />
              <p>Yüklemek istediğiniz görüntüyü seçin</p>
              <small>PNG, JPG veya JPEG formatında</small>
            </div>
          )}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Önizleme" />
            </div>
          )}
        </div>

        <div className="form-details">
          <h3>Görüntü Detayları</h3>
          
          <div className="teeth-section">
            <label>Diş Seçimi:</label>
            {renderTeethGrid()}
          </div>

          <div className="form-group">
            <label htmlFor="toothNumber">Diş Numarası:</label>
            <input
              type="number"
              id="toothNumber"
              min="1"
              value={formData.toothNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, toothNumber: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Görüntü Tipi:</label>
            <select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="">Seçiniz</option>
              <option value="Panoramik">Panoramik</option>
              <option value="Periapikal">Periapikal</option>
              <option value="Bite-wing">Bite-wing</option>
            </select>
          </div>

          {!appointmentId && appointments.length > 0 && (
            <div className="form-group">
              <label htmlFor="appointmentId">Randevu (Opsiyonel):</label>
              <select
                id="appointmentId"
                value={formData.appointmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentId: e.target.value }))}
              >
                <option value="">Randevu Seçin</option>
                {appointments.map(appointment => (
                  <option key={appointment.id} value={appointment.id}>
                    {formatDate(appointment.date)} - {appointment.reason}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="diagnosis">Teşhis:</label>
            <textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notlar:</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Yükleniyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
};

export default AddRadiograph; 