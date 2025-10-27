import './EventAnalytics.css';

export default function EventAnalytics({ navigateTo }) {
  return (
    <div className="event-analytics-container">
      <div className="event-analytics-header">
        <button className="event-analytics-back-button" onClick={() => navigateTo('my-events')}>
          ← Back
        </button>
        <h1 className="event-analytics-title">Event Analytics</h1>
      </div>

      <div className="event-analytics-content">
        <h2 className="event-analytics-heading">
          Tech Talk: AI in Healthcare
        </h2>

        <div className="event-analytics-metrics">
          {[
            { value: '67', label: 'Total RSVPs' },
            { value: '52', label: 'Attended' },
            { value: '77.6%', label: 'Check-in Rate' },
            { value: '4.5★', label: 'Avg Rating' }
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

        <div className="event-analytics-section">
          <h3 className="event-analytics-section-title">
            RSVP Timeline
          </h3>
          <div className="event-analytics-chart">
            <div className="event-analytics-chart-bars">
              {[20, 40, 60, 80, 100].map((height, i) => (
                <div key={i} className="event-analytics-chart-bar" style={{ height: height + '%' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="event-analytics-insights">
          <h3 className="event-analytics-section-title">
            Key Insights
          </h3>
          {[
            { icon: '↑', text: 'Peak RSVP day was 5 days before event' },
            { icon: '•', text: '78% of attendees were first-time participants' }
          ].map((insight, i) => (
            <div key={i} className="event-analytics-insight-card">
              <span className="event-analytics-insight-icon">{insight.icon}</span>
              <p className="event-analytics-insight-text">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

