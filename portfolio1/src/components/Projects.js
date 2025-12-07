import React from 'react';
import './Projects.css';

const Projects = () => {
  const projects = [
    {
      title: 'Telesto - Advanced 3D Geological Grid Generator',
      description: 'Professional-grade geological subsurface modeling tool built with React and modern web technologies. Features multi-horizon processing, advanced fault modeling, intelligent interpolation, and property modeling with 3D visualization.',
      technologies: ['React 19.1.1', 'TypeScript', 'Zustand', 'Tailwind CSS', '3D Visualization'],
      link: 'https://github.com/Goldmauler',
      impact: 'Production-ready tool'
    },
    {
      title: 'Sign Language to Text Conversion',
      description: 'Machine learning model for real-time sign language recognition. Achieved 85%+ accuracy in real-time recognition with inference latency under 150ms for common signs using TensorFlow and OpenCV.',
      technologies: ['Python', 'TensorFlow', 'OpenCV', 'ML'],
      link: 'https://github.com/Goldmauler',
      impact: '85%+ accuracy'
    },
    {
      title: 'Cricket Auction Game - Multiplayer Team Building',
      description: 'Real-time multiplayer auction game enabling multiple users to bid on cricket players simultaneously using TCP WebSocket connections. Features AI-powered team rating system for strategic insights and optimized WebSocket communication for concurrent users.',
      technologies: ['Node.js', 'WebSocket', 'Python (AI/ML)', 'HTML/CSS/JavaScript'],
      link: 'https://github.com/Goldmauler',
      impact: 'Real-time multiplayer'
    },
    {
      title: 'ValueCentric - Blockchain Supply Chain with Privacy',
      description: 'Full-stack decentralized application integrating blockchain technology for supply chain tracking with data privacy through cryptographic hashing. Enables transparent product provenance tracking while protecting sensitive business data.',
      technologies: ['Ganache', 'Truffle', 'Web3.js', 'Blockchain', 'JavaScript'],
      link: 'https://github.com/Goldmauler',
      impact: 'Data privacy enabled'
    },
    {
      title: 'Company Website - HIVETZ Nutri PVT Limited',
      description: 'Developed and deployed a responsive company website using Next.js frontend framework with custom domain integration. Delivered a production-ready web solution within 1 month, enhancing online presence and user engagement.',
      technologies: ['Next.js', 'React', 'CSS', 'Web Deployment'],
      link: 'https://github.com/Goldmauler',
      impact: 'Production deployed'
    },
    {
      title: 'College Hall Booking System',
      description: 'Centralized system managing hall and classroom bookings. Handles 100+ daily requests, reducing scheduling conflicts by 70% with efficient MERN stack architecture.',
      technologies: ['MongoDB', 'Express', 'React', 'Node.js'],
      link: 'https://github.com/Goldmauler',
      impact: '70% conflict reduction'
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
