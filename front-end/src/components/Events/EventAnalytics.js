import { useState, useEffect } from 'react';
import { getEventAnalytics } from '../../services/api';
import './EventAnalytics.css';

export default function EventAnalytics({ navigateTo, event }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data from backend
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!event) return;

      try {
        setLoading(true);
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view analytics.');
          setLoading(false);
          return;
        }
        
        const response = await getEventAnalytics(event.id);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        const errMsg = err.message?.toLowerCase() || '';
        if (errMsg.includes('token') || errMsg.includes('log in') || errMsg.includes('unauthorized')) {
          setError('Please log in to view analytics.');
        } else {
          setError(err.message || 'Failed to load analytics');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [event]);

  // If no event is provided, show a fallback
  if (!event) {
    return (
      <div className="event-analytics-container">
        <div className="event-analytics-header">
          <button className="event-analytics-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-analytics-title">Event Analytics</h1>
        </div>
        <div className="event-analytics-content">
          <p>No event selected for analytics</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="event-analytics-container">
        <div className="event-analytics-header">
          <button className="event-analytics-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-analytics-title">Event Analytics</h1>
        </div>
        <div className="event-analytics-content">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="event-analytics-container">
        <div className="event-analytics-header">
          <button className="event-analytics-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-analytics-title">Event Analytics</h1>
        </div>
        <div className="event-analytics-content">
          <p style={{ color: '#d32f2f' }}>{error}</p>
          <p>Note: Analytics are only available for events you are hosting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-analytics-container">
      <div className="event-analytics-header">
        <button className="event-analytics-back-button" onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 className="event-analytics-title">Event Analytics</h1>
      </div>

      <div className="event-analytics-content">
        <h2 className="event-analytics-heading">
          {event.title}
        </h2>

        {/* Real metrics from backend */}
        <div className="event-analytics-metrics">
          {[
            { value: analytics?.metrics.totalRSVPs || '0', label: 'Total RSVPs' },
            { value: analytics?.metrics.totalCheckIns || '0', label: 'Attended' },
            { value: analytics?.metrics.checkInRate || 'N/A', label: 'Check-in Rate' },
            { value: analytics?.metrics.averageRating || 'N/A', label: 'Avg Rating' }
          ].map((metric, i) => (
            <div key={i} className="event-analytics-metric-card">
              <div className="event-analytics-metric-value">
                {metric.value}
              </div>
              <div className="event-analytics-metric-label">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* RSVP Timeline from backend */}
        <div className="event-analytics-section">
          <h3 className="event-analytics-section-title">
            RSVP Timeline
          </h3>
          <div className="event-analytics-chart">
            <div className="event-analytics-chart-bars">
              {analytics?.rsvpTimeline?.map((dayData, i) => {
                const maxCount = Math.max(...(analytics.rsvpTimeline.map(d => d.count) || [1]));
                const height = maxCount > 0 ? (dayData.count / maxCount * 100) : 0;
                return (
                  <div key={i} className="event-analytics-chart-bar" style={{ height: height + '%' }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Insights from backend */}
        <div className="event-analytics-insights">
          <h3 className="event-analytics-section-title">
            Key Insights
          </h3>
          {analytics?.insights?.map((insight, i) => (
            <div key={i} className="event-analytics-insight-card">
              <span className="event-analytics-insight-icon">{insight.icon}</span>
              <p className="event-analytics-insight-text">
                {insight.text}
              </p>
            </div>
          ))}
        </div>

        {/* Survey Results (if available) */}
        {analytics?.surveys && analytics.surveys.length > 0 && (
          <div className="event-analytics-section">
            <h3 className="event-analytics-section-title">
              Survey Responses ({analytics.metrics.totalSurveys})
            </h3>
            {analytics.surveys.slice(0, 3).map((survey, i) => (
              <div key={i} style={{ 
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Rating:</strong> {'★'.repeat(survey.rating)}{'☆'.repeat(5 - survey.rating)}
                </div>
                {survey.enjoyedAspects && survey.enjoyedAspects.length > 0 && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Enjoyed:</strong> {survey.enjoyedAspects.join(', ')}
                  </div>
                )}
                {survey.feedback && (
                  <div>
                    <strong>Feedback:</strong> {survey.feedback}
                  </div>
                )}
              </div>
            ))}
            {analytics.surveys.length > 3 && (
              <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
                ... and {analytics.surveys.length - 3} more responses
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

