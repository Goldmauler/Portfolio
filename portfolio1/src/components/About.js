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
          <div className="stats-line">
            <span className="stat-item">4+ Years</span>
            <span className="stat-divider">•</span>
            <span className="stat-item">7+ Projects</span>
            <span className="stat-divider">•</span>
            <span className="stat-item">3 Research Papers</span>
          </div>
          <div className="education-line">
            <h3 className="edu-title">B.Tech Computer Science & Engineering</h3>
            <p className="edu-subtitle">Amrita Vishwa Vidyapeetham • Expected 2025</p>
          </div>
          <div className="interests-section">
            <h3 className="interests-title">Interests</h3>
            <div className="interests-line">
              <span className="interest">Competitive Programming</span>
              <span className="interest">Cybersecurity & CTFs</span>
              <span className="interest">Problem Solving</span>
              <span className="interest">Model United Nations</span>
              <span className="interest">Public Speaking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
