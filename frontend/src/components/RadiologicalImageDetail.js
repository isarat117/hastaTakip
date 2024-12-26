import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import './RadiologicalImageDetail.css';

const RadiologicalImageDetail = () => {
  const { tcNumber, imageId } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [editingNote, setEditingNote] = useState('');
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [teethNotes, setTeethNotes] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const fetchImage = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/radiographs/${imageId}`);
      if (!response.ok) {
        throw new Error('Görüntü yüklenirken bir hata oluştu');
      }
      const data = await response.json();
      setImage(data);
      setEditingNote(data.toothNotes?.[selectedTooth] || '');

      const allImagesResponse = await fetch(`http://localhost:3000/api/patients/${tcNumber}/radiographs`);
      if (!allImagesResponse.ok) {
        throw new Error('Görüntüler yüklenirken bir hata oluştu');
      }
      const allImagesData = await allImagesResponse.json();
      setImages(allImagesData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [imageId, selectedTooth, tcNumber]);

  useEffect(() => {
    fetchImage();
  }, [fetchImage]);

  useEffect(() => {
    const fetchTeethNotes = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}/teeth/notes`);
        if (!response.ok) {
          throw new Error('Diş notları alınamadı');
        }
        const data = await response.json();
        setTeethNotes(data);
      } catch (error) {
        console.error('Diş notları alınırken hata:', error);
      }
    };

    fetchTeethNotes();
  }, [tcNumber]);

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 4);
      setScale(newScale);
    }
  };

  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.2, 4));
  };

  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - startPosition.x;
      const newY = e.clientY - startPosition.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsPanning(!isPanning);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanning]);

  const handleToothClick = (toothNumber) => {
    if (selectedTooth === toothNumber) {
      setSelectedTooth(null);
      setShowConfirmPopup(null);
    } else {
      setSelectedTooth(toothNumber);
      setShowConfirmPopup(null);
      setShowNoteEditor(false);
      setEditingNote('');
    }
  };

  const handleAddNote = () => {
    setShowNoteEditor(true);
  };

  const handleSaveNote = async () => {
    if (!selectedTooth || !editingNote.trim()) return;

    try {
      console.log('Not gönderiliyor:', {
        note: editingNote,
        createdBy: 'Doktor'
      });

      const response = await fetch(`http://localhost:3000/api/patients/${tcNumber}/teeth/${selectedTooth}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          note: editingNote,
          createdBy: 'Doktor',
          createdAt: new Date().toISOString() // Tarih formatını düzeltelim
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Not kaydedilirken bir hata oluştu');
      }

      const notesResponse = await fetch(`http://localhost:3000/api/patients/${tcNumber}/teeth/notes`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        setTeethNotes(notesData);
      }

      setShowNoteEditor(false);
      setEditingNote('');
    } catch (error) {
      setError(error.message);
      console.error('Not kaydetme hatası:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createTeethNumbers = () => {
    const upperTeeth = [
      18, 17, 16, 15, 14, 13, 12, 11,
      21, 22, 23, 24, 25, 26, 27, 28
    ];
    
    const lowerTeeth = [
      48, 47, 46, 45, 44, 43, 42, 41,
      31, 32, 33, 34, 35, 36, 37, 38
    ];

    return { upperTeeth, lowerTeeth };
  };

  const renderToothConfirmPopup = (toothNumber) => {
    const isUpperTooth = (toothNumber >= 11 && toothNumber <= 18) || (toothNumber >= 21 && toothNumber <= 28);
    
    return (
      <div className={`tooth-confirm-popup ${isUpperTooth ? 'top' : 'bottom'}`}>
        <button 
          className="confirm"
          onClick={(e) => {
            e.stopPropagation();
            setShowNoteEditor(true);
            setShowConfirmPopup(null);
          }}
        >
          Not Ekle
        </button>
        <button 
          className="cancel"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirmPopup(null);
            setSelectedTooth(null);
          }}
        >
          İptal
        </button>
      </div>
    );
  };

  const handleImageClick = (radiographId) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    navigate(`/patients/${tcNumber}/radiographs/${radiographId}`);
  };

  const renderSelectedToothInfo = () => {
    if (!selectedTooth) return null;

    const relatedRadiographs = images.filter(img => Number(img.toothNumber) === selectedTooth);
    const notes = teethNotes[selectedTooth] || [];

    return (
      <div className="selected-tooth-info">
        <h4>{selectedTooth} Numaralı Diş Bilgileri</h4>
        
       
        <div className="tooth-info-section">
          <h5>Notlar</h5>
          {notes.length > 0 ? (
            <div className="tooth-info-list">
              {notes.map((note, index) => (
                <div key={index} className="tooth-info-item">
                  <div className="note-content">{note.note}</div>
                  <div className="note-date">{formatDate(note.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Not bulunmamaktadır.</p>
          )}
        </div>

        <div className="tooth-info-section">
          <h5>Radyoloji Görüntüleri</h5>
          {relatedRadiographs.length > 0 ? (
            <div className="tooth-info-list">
              {relatedRadiographs.map((radiograph, index) => (
                <div 
                  key={index}
                  className="tooth-info-item"
                  onClick={() => handleImageClick(radiograph.id)}
                >
                  <div className="radiograph-info">
                    <span>Radyoloji Görüntüsü #{index + 1}</span>
                    <span className="radiograph-date">{formatDate(radiograph.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Görüntü bulunmamaktadır.</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!image) return <div className="error">Görüntü bulunamadı</div>;

  const { upperTeeth, lowerTeeth } = createTeethNumbers();

  const renderToothPopup = (toothNumber) => {
    const relatedRadiographs = images.filter(img => Number(img.toothNumber) === toothNumber);
    const notes = teethNotes[toothNumber] || [];

    return (
      <div className="tooth-popup">
        <div className="title">{toothNumber} Numaralı Diş</div>
        
        {notes.length > 0 ? (
          <div className="content">
            <strong>Notlar:</strong>
            <ul>
              {notes.map((note, index) => (
                <li key={index}>{note.note} - {formatDate(note.createdAt)}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="content">
            <p>Bu diş için henüz not eklenmemiş.</p>
          </div>
        )}

        {!showNoteEditor ? (
          <div className="actions">
            <button className="button primary" onClick={handleAddNote}>
              Not Ekle
            </button>
            {relatedRadiographs.length > 0 && (
              <button 
                className="button"
                onClick={() => navigate(`/patients/${tcNumber}/radiographs/${relatedRadiographs[0].id}`)}
              >
                Görüntüye Git ({relatedRadiographs.length})
              </button>
            )}
          </div>
        ) : (
          <div className="tooth-note-editor">
            <textarea
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              placeholder="Not ekleyin..."
            />
            <div className="actions">
              <button className="button primary" onClick={handleSaveNote}>
                Kaydet
              </button>
              <button className="button" onClick={() => {
                setShowNoteEditor(false);
                setEditingNote('');
              }}>
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="radiological-image-detail">
      <div className="detail-card">
        <div className="card-header">
          <button className="button back" onClick={() => navigate(`/patients/${tcNumber}/radiographs`)}>
            <ArrowLeft className="icon" />
            Geri
          </button>
          <h2>Radyoloji Görüntüsü</h2>
          <div className="zoom-controls">
            <button className="button" onClick={handleZoomIn} title="Yakınlaştır">
              <ZoomIn size={18} />
            </button>
            <button className="button" onClick={handleZoomOut} title="Uzaklaştır">
              <ZoomOut size={18} />
            </button>
            <button className="button" onClick={handleReset} title="Sıfırla">
              <Maximize2 size={18} />
            </button>
          </div>
        </div>

        <div className="card-content">
          <div 
            className={`image-section ${isPanning ? 'panning' : ''}`}
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="image-container">
              <img 
                ref={imageRef}
                src={`http://localhost:3000${image.imagePath}`} 
                alt={`Diş ${image.toothNumber}`}
                className="main-image"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  cursor: isDragging ? 'grabbing' : (isPanning ? 'grab' : 'default')
                }}
                draggable="false"
              />
            </div>
            <div className="pan-mode-indicator">
              {isPanning ? 'Hareket Modu Aktif (Enter ile kapatın)' : 'Hareket Modu için Enter tuşuna basın'}
            </div>
          </div>

          <div className="teeth-section">
            <h3>Diş Notları</h3>
            <div className="teeth-grid">
              <div className="teeth-row">
                {upperTeeth.map(number => (
                  <div
                    key={number}
                    className={`tooth 
                      ${Number(image.toothNumber) === number ? 'highlighted' : ''}
                      ${teethNotes[number]?.length > 0 ? 'has-note' : ''} 
                      ${selectedTooth === number ? 'selected' : ''} 
                      ${images.some(img => Number(img.toothNumber) === number && img.id !== image.id) ? 'has-radiograph' : ''}`}
                    onClick={() => handleToothClick(number)}
                    style={{ position: 'relative' }}
                  >
                    {number}
                    {selectedTooth === number && !showNoteEditor && (
                      renderToothConfirmPopup(number)
                    )}
                  </div>
                ))}
              </div>
              <div className="teeth-row">
                {lowerTeeth.map(number => (
                  <div
                    key={number}
                    className={`tooth 
                      ${Number(image.toothNumber) === number ? 'highlighted' : ''}
                      ${teethNotes[number]?.length > 0 ? 'has-note' : ''} 
                      ${selectedTooth === number ? 'selected' : ''} 
                      ${images.some(img => Number(img.toothNumber) === number && img.id !== image.id) ? 'has-radiograph' : ''}`}
                    onClick={() => handleToothClick(number)}
                    style={{ position: 'relative' }}
                  >
                    {number}
                    {selectedTooth === number && !showNoteEditor && (
                      renderToothConfirmPopup(number)
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Tarih:</span>
                <span>{formatDate(image.date)}</span>
              </div>
              <div className="info-item">
                <span className="label">Diş No:</span>
                <span>{image.toothNumber}</span>
              </div>
              <div className="info-item">
                <span className="label">Tip:</span>
                <span>{image.type}</span>
              </div>
              <div className="info-item">
                <span className="label">Teşhis:</span>
                <span>{image.diagnosis}</span>
              </div>
              {image.notes && (
                <div className="info-item">
                  <span className="label">Notlar:</span>
                  <span>{image.notes}</span>
                </div>
              )}
            </div>

            {renderSelectedToothInfo()}
          </div>
        </div>

        {showNoteEditor && selectedTooth && (
          <div className="note-editor">
            <h4>{selectedTooth} Numaralı Diş için Not</h4>
            <textarea
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              placeholder="Not ekleyin..."
            />
            <div className="note-actions">
              <button className="button primary" onClick={handleSaveNote}>
                Kaydet
              </button>
              <button className="button" onClick={() => {
                setShowNoteEditor(false);
                setEditingNote('');
              }}>
                İptal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RadiologicalImageDetail; 