import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Eye } from 'lucide-react';
import './RadiologicalImages.css';

const RadiologicalImages = () => {
  const { tcNumber } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);

  const fetchImages = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}/radiographs`);
      if (!response.ok) {
        throw new Error('Görüntüler yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setImages(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [tcNumber]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDelete = async (id) => {
    if (!window.confirm('Bu görüntüyü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/radiographs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Görüntü silinirken bir hata oluştu');
      }

      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + 
           date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleToothClick = (tooth) => {
    setSelectedTooth(tooth);
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
              className={`tooth ${selectedTooth === number ? 'selected' : ''}`}
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
              className={`tooth ${selectedTooth === number ? 'selected' : ''}`}
              onClick={() => handleToothClick(number)}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="radiological-images">
      <div className="card">
        <div className="card-header">
          <div className="header-left">
            <button className="button back" onClick={() => navigate(`/patients/${tcNumber}`)}>
              <ArrowLeft className="icon" />
              Geri
            </button>
            <h2>Radyolojik Görüntüler</h2>
          </div>
          <button 
            className="button primary" 
            onClick={() => navigate(`/patients/${tcNumber}/radiographs/new`)}
          >
            <Plus className="icon" />
            Yeni Görüntü Ekle
          </button>
        </div>

        <div className="card-content">
          <div className="teeth-section">
            <label>Diş Seçimi:</label>
            {renderTeethGrid()}
          </div>

          {images.length === 0 ? (
            <div className="no-records">Görüntü bulunmamaktadır</div>
          ) : (
            <div className="table">
              <div className="table-header">
                <div className="table-row">
                  <div className="table-cell">Tarih</div>
                  <div className="table-cell">Diş No</div>
                  <div className="table-cell">Tip</div>
                  <div className="table-cell">Teşhis</div>
                  <div className="table-cell">İşlemler</div>
                </div>
              </div>
              <div className="table-body">
                {images
                  .filter(image => !selectedTooth || Number(image.toothNumber) === selectedTooth)
                  .map((image) => (
                  <div key={image.id} className="table-row">
                    <div className="table-cell">{formatDate(image.date)}</div>
                    <div className="table-cell">{image.toothNumber}</div>
                    <div className="table-cell">{image.type}</div>
                    <div className="table-cell">{image.diagnosis}</div>
                    <div className="table-cell actions">
                      <button 
                        className="button primary small"
                        onClick={() => navigate(`/patients/${tcNumber}/radiographs/${image.id}`)}
                      >
                        <Eye className="icon" size={16} />
                        Görüntüle
                      </button>
                      <button 
                        className="button delete small"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="icon" size={16} />
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RadiologicalImages; 