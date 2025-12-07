import React from 'react';
import './Hero.css';

const Hero = () => {
  const socialLinks = [
    { icon: '🔗', label: 'LinkedIn', url: 'https://linkedin.com/in/vimal-harihar-27979a255', color: '#0A66C2' },
    { icon: '⭐', label: 'GitHub', url: 'https://github.com/Goldmauler', color: '#333' },
    { icon: '✉️', label: 'Email', url: 'mailto:vimal007.x@gmail.com', color: '#EA4335' }
  ];

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="glitch-text">VIMAL HARIHAR</span>
        </h1>
        <p className="hero-subtitle">
          CS Undergraduate | AI & Quality Assurance Enthusiast | Full Stack Developer
        </p>
        <p className="hero-location">📍 Coimbatore, India • Open to opportunities in Malaysia</p>
        
        <div className="hero-cta-section">
          <div className="social-links">
            {socialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title={link.label}
              >
                <span className="social-icon">{link.icon}</span>
              </a>
            ))}
          </div>
          <a href="/contact" className="cta-button">Get In Touch</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
