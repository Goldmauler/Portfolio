import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! I\'ll get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <div className="contact-left">
            <div className="contact-info">
              <h3 className="contact-subtitle">Let's work together</h3>
              <p className="contact-description">
                I'm always open to discussing new projects, research opportunities, 
                or collaborations in AI, IoT, and Full Stack Development.
              </p>
            </div>
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Your message..."
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>

            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span>vimal007.x@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Phone:</span>
                <span>+91-9489874744</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Location:</span>
                <span>Coimbatore, India</span>
              </div>
            </div>

            <div className="social-links">
              <a href="https://github.com/Goldmauler" className="social-link" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/vimal-harihar-27979a255" className="social-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="mailto:vimal007.x@gmail.com" className="social-link">Email</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
