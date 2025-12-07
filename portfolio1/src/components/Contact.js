import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Using Formspree for email handling
      const response = await fetch('https://formspree.io/f/xyzqwvab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        alert('Thank you for your message! I\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
        alert('Failed to send message. Please try again or email me directly.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
      alert('Error sending message. Please contact me directly at vimal007.x@gmail.com');
    } finally {
      setLoading(false);
    }
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
                I'm always open to discussing new projects, research opportunities, internships, 
                or collaborations in AI, QA Testing, IoT, and Full Stack Development.
              </p>
              
              <div className="direct-contact-links">
                <h4>Or reach out directly:</h4>
                <p className="contact-item">
                  <a href="mailto:vimal007.x@gmail.com" className="contact-email">vimal007.x@gmail.com</a>
                </p>
                <p className="contact-item">
                  <a href="tel:+919489874744" className="contact-phone">+91-9489874744</a>
                </p>
                <p className="contact-item">
                  <a href="https://linkedin.com/in/vimal-harihar-27979a255" target="_blank" rel="noopener noreferrer" className="contact-linkedin">LinkedIn Profile</a>
                </p>
                <p className="contact-item">
                  <a href="https://github.com/Goldmauler" target="_blank" rel="noopener noreferrer" className="contact-github">GitHub Repository</a>
                </p>
              </div>
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
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {submitStatus === 'success' && (
                <p className="success-message">✓ Message sent successfully!</p>
              )}
              {submitStatus === 'error' && (
                <p className="error-message">✗ Failed to send message. Please try again.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
