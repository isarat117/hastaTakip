import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import './FinancialSummary.css';
import { BASE_URL } from '../config/config';

const FinancialSummary = () => {
  const navigate = useNavigate();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/financial-summary?startDate=${startDate}&endDate=${endDate}`);

      if (!response.ok) {
        throw new Error('Veri getirme hatası');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      setError('Mali özet alınırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const handleQuickSelect = (period) => {
    const today = new Date();
    let start = new Date();

    switch (period) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        start = lastMonth;
        today.setTime(lastDayOfLastMonth.getTime());
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSummary();
    }
  }, [startDate, endDate]);

  return (
    <div className="financial-summary">
      <div className="summary-card">
        <div className="card-header">
          <button className="back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Geri
          </button>
          <h2>Mali Özet</h2>
        </div>

        <div className="quick-select">
          <button 
            className="quick-select-button" 
            onClick={() => handleQuickSelect('today')}
          >
            <Calendar size={16} />
            Bugün
          </button>
          <button 
            className="quick-select-button" 
            onClick={() => handleQuickSelect('thisMonth')}
          >
            <Calendar size={16} />
            Bu Ay
          </button>
          <button 
            className="quick-select-button" 
            onClick={() => handleQuickSelect('lastMonth')}
          >
            <Calendar size={16} />
            Geçen Ay
          </button>
        </div>

        <div className="date-filters">
          <div className="date-input">
            <label>Başlangıç Tarihi:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-input">
            <label>Bitiş Tarihi:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading">Yükleniyor...</div>}

        {summary && (
          <div className="summary-content">
            <div className="summary-grid">
              <div className="summary-item">
                <h3>Toplam Gelir</h3>
                <p className="amount positive">{formatCurrency(summary.totalPayments)}</p>
              </div>
              <div className="summary-item">
                <h3>Toplam Borç</h3>
                <p className="amount negative">{formatCurrency(summary.totalCost)}</p>
              </div>
              <div className="summary-item">
                <h3>Net Durum</h3>
                <p className={`amount ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>

            <div className="summary-details">
              <h3>Detaylı Özet</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span>Seçilen Tarih Aralığı:</span>
                  <span>
                    {new Date(summary.startDate).toLocaleDateString('tr-TR')} - 
                    {new Date(summary.endDate).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="detail-item">
                  <span>Toplam Tahsilat:</span>
                  <span className="positive">{formatCurrency(summary.totalPayments)}</span>
                </div>
                <div className="detail-item">
                  <span>Toplam Borç:</span>
                  <span className="negative">{formatCurrency(summary.totalCost)}</span>
                </div>
                <div className="detail-item">
                  <span>Kar/Zarar:</span>
                  <span className={summary.balance >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(summary.balance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialSummary; 