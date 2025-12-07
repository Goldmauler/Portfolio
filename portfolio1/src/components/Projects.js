import React from 'react';
import './Projects.css';

const Projects = () => {
  const projects = [
    {
      title: 'Sign Language to Text Conversion',
      description: 'Machine learning model for real-time sign language recognition with 85%+ accuracy and <150ms inference latency for common signs.',
      technologies: ['Python', 'TensorFlow', 'OpenCV', 'ML'],
      link: '#',
      impact: '85%+ accuracy'
    },
    {
      title: 'Elephant Monitoring & Alert System',
      description: 'IoT-based system to detect elephant movement and send alerts to villagers. Improved detection accuracy by 60% through sensor fusion.',
      technologies: ['Arduino UNO', 'IoT', 'Ultrasonic Sensor', 'PIR Sensor'],
      link: '#',
      impact: '60% accuracy improvement'
    },
    {
      title: 'College Hall Booking System',
      description: 'Centralized system managing hall and classroom bookings. Handles 100+ daily requests, reducing scheduling conflicts by 70%.',
      technologies: ['MongoDB', 'Express', 'Node.js'],
      link: '#',
      impact: '70% conflict reduction'
    },
    {
      title: 'Cricket Champions - Guessing Battle',
      description: 'Interactive web game with customizable settings, timed multi-round format. Optimized animations improving responsiveness by 40%.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Animations'],
      link: '#',
      impact: '40% performance boost'
    },
    {
      title: 'Digital Canteen Menu Display',
      description: 'Live web-based menu system eliminating physical menu checks. Reduced foot traffic congestion by 30% with real-time updates.',
      technologies: ['MongoDB', 'Express', 'Node.js'],
      link: '#',
      impact: '30% congestion reduction'
    },
    {
      title: 'NSS Volunteer Management Portal',
      description: 'Web portal for attendance marking and volunteer data management. Reduced manual processing time by 50%.',
      technologies: ['MongoDB', 'Express', 'Node.js'],
      link: '#',
      impact: '50% time saved'
    }
  ];

  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        <h2 className="section-title">Featured Projects</h2>
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <div key={idx} className="project-card">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-tech">
                {project.technologies.map((tech, techIdx) => (
                  <span key={techIdx} className="tech-tag">{tech}</span>
                ))}
              </div>
              {project.impact && (
                <div className="project-impact">
                  <span className="impact-badge">{project.impact}</span>
                </div>
              )}
              <a href={project.link} className="project-link">
                View Project →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
