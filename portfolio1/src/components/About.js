import React from 'react';
import './About.css';

const About = () => {
  return (
    <section className="about-section" id="about">
      <div
        className="about-container"
        style={{
          zIndex: 2,
          position: 'relative',
          background: 'rgba(10,10,10,0.7)',
          width: '100%',
          maxWidth: '900px',
          margin: '4rem auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          borderRadius: '20px',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
          pointerEvents: 'auto',
        }}
      >
        <h2 className="section-title">About Me</h2>
        <div className="content-wrapper">
          <div className="professional-summary">
            <p className="summary-text">
              Computer Science undergraduate with strong foundations in automation testing, AI, and quality assurance processes. 
              Passionate about applying emerging AI-driven techniques to improve quality and user experience. 
              Experienced Full Stack Developer and Research Contributor.
            </p>
          </div>
          
          <div className="stats-line">
            <span className="stat-item">7+ Projects</span>
            <span className="stat-divider">•</span>
            <span className="stat-item">3 Research Papers</span>
            <span className="stat-divider">•</span>
            <span className="stat-item">MUNSOC Head</span>
          </div>
          
          <div className="education-line">
            <h3 className="edu-title">B.Tech Computer Science & Engineering</h3>
            <p className="edu-subtitle">Amrita Vishwa Vidyapeetham • CGPA: 7.51/10.0 • Jun 2025</p>
          </div>
          
          <div className="contact-info-section">
            <h3 className="contact-title">Contact Information</h3>
            <div className="contact-details">
              <p><a href="mailto:vimal007.x@gmail.com" className="contact-link">vimal007.x@gmail.com</a></p>
              <p><a href="tel:+919489874744" className="contact-link">+91-9489874744</a></p>
              <p>Coimbatore, India • Open to Kuala Lumpur, Malaysia</p>
            </div>
          </div>
          
          <div className="interests-section">
            <h3 className="interests-title">Key Interests</h3>
            <div className="interests-line">
              <span className="interest">AI & Machine Learning</span>
              <span className="interest">QA & Testing Automation</span>
              <span className="interest">Full Stack Development</span>
              <span className="interest">IoT Systems</span>
              <span className="interest">Blockchain & Web3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
