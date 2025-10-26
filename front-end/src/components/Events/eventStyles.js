export const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingBottom: '20px'
  },
  header: {
    backgroundColor: '#6B46C1',
    color: 'white',
    padding: '24px 32px',
    textAlign: 'center',
    position: 'relative'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600'
  },
  backButton: {
    position: 'absolute',
    left: '32px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px 16px',
    transition: 'opacity 0.2s ease'
  },
  controls: {
    padding: '24px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  filterRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  select: {
    flex: '1 1 200px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  sortContainer: {
    position: 'relative',
    flex: '1 1 200px'
  },
  sortButton: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left'
  },
  sortMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginTop: '4px',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  sortOption: {
    padding: '14px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s ease'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    marginBottom: '16px',
    boxSizing: 'border-box'
  },
  createButton: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#6B46C1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  eventList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    padding: '0'
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    height: 'fit-content'
  },
  eventImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover'
  },
  eventContent: {
    padding: '20px'
  },
  eventTitle: {
    margin: '0 0 12px 0',
    fontSize: '19px',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.4'
  },
  eventInfo: {
    margin: '6px 0',
    fontSize: '14px',
    color: '#666'
  },
  eventRsvp: {
    margin: '12px 0 8px 0',
    fontSize: '14px',
    color: '#6B46C1',
    fontWeight: '600'
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '12px'
  },
  tag: {
    padding: '6px 14px',
    backgroundColor: '#f0e7ff',
    color: '#6B46C1',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500'
  },
  bottomNav: {
    display: 'none'
  },
  navButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer'
  },
  navButtonActive: {
    color: '#6B46C1',
    fontWeight: '600'
  },
  heroImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover'
  },
  detailContent: {
    padding: '32px',
    backgroundColor: 'white',
    maxWidth: '900px',
    margin: '0 auto'
  },
  detailTitle: {
    margin: '0 0 20px 0',
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    lineHeight: '1.3'
  },
  detailInfo: {
    margin: '10px 0',
    fontSize: '16px',
    color: '#666'
  },
  section: {
    marginTop: '32px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333'
  },
  description: {
    fontSize: '16px',
    lineHeight: '1.7',
    color: '#666'
  },
  hostSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px'
  },
  hostAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '30px'
  },
  hostLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#999'
  },
  hostName: {
    margin: '6px 0 0 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333'
  },
  rsvpButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '18px',
    backgroundColor: '#6B46C1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '32px',
    transition: 'background-color 0.2s ease'
  },
  rsvpButtonDisabled: {
    width: '100%',
    maxWidth: '400px',
    padding: '18px',
    backgroundColor: '#ccc',
    color: '#666',
    border: 'none',
    borderRadius: '8px',
    fontSize: '17px',
    fontWeight: '600',
    marginTop: '32px',
    cursor: 'not-allowed'
  },
  primaryButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '16px',
    backgroundColor: '#6B46C1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'white',
    color: '#6B46C1',
    border: '1px solid #6B46C1',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'all 0.2s ease'
  },
  myEventsContent: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  eventSection: {
    marginBottom: '40px'
  },
  sectionHeader: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#333'
  },
  myEventCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'box-shadow 0.2s ease'
  },
  myEventTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#333'
  },
  myEventInfo: {
    fontSize: '15px',
    color: '#666',
    margin: '6px 0'
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '15px',
    padding: '40px'
  },
  dashboardContent: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  attentionSection: {
    marginBottom: '40px'
  },
  attentionHeader: {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#FF6B6B'
  },
  attentionCard: {
    backgroundColor: '#FFF3F3',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid #FFE0E0'
  },
  attentionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 12px 0',
    color: '#333'
  },
  attentionInfo: {
    fontSize: '15px',
    color: '#666',
    marginBottom: '16px'
  },
  buttonRow: {
    display: 'flex',
    gap: '12px'
  },
  actionButton: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: '#6B46C1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  actionButtonSecondary: {
    flex: 1,
    padding: '12px 20px',
    backgroundColor: 'white',
    color: '#6B46C1',
    border: '1px solid #6B46C1',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

// Media queries for responsive grid
export const gridStyles = `
@media (min-width: 1200px) {
  .event-list {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .event-list {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 767px) {
  .event-list {
    grid-template-columns: 1fr !important;
  }
}
`;