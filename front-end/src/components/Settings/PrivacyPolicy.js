import { faker } from '@faker-js/faker';
import './PrivacyPolicy.css';

export default function PrivacyPolicy({ navigateTo }) {
  // Generate fake company and contact data
    const privacyPolicy = faker.lorem.paragraphs(5);

  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <h1 className="privacy-header">Privacy Policy</h1>

        <p className="privacy-text">{privacyPolicy}</p>

        <button className="back-button" onClick={() => navigateTo('settings')}>
          Back to Settings
        </button>
      </div>
    </div>
  );
}
