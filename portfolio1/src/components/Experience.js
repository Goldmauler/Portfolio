import React from 'react';
import './Experience.css';

const Experience = () => {
  const experiences = [
    {
      role: 'Web Developer',
      organization: 'HIVETZ Nutri PVT Limited',
      period: '2024-2025',
      description: 'Developed and deployed a responsive company website using Next.js frontend framework with custom domain integration. Delivered a production-ready web solution within 1 month, enhancing the company\'s online presence and user engagement.'
    },
    {
      role: 'Head of Operations',
      organization: 'MUNSOC Club, Amrita Vishwa Vidyapeetham',
      period: '2023-2025',
      description: 'Planned and organized Model UN events, leading operations to ensure smooth execution and delegate engagement. Introduced a new feedback system that enhanced club event quality and member satisfaction. Earned 5 titles including High Comm.'
    },
    {
      role: 'Undergraduate Researcher',
      organization: 'Amrita Vishwa Vidyapeetham',
      period: '2024-2025',
      description: 'Co-authored research papers in AI, Smart Systems, and IoT. Contributed to literature review and experimental design for multiple research initiatives.'
    },
    {
      role: 'Public Relations Volunteer',
      organization: 'Anokha Tech Fest, Amrita Vishwa Vidyapeetham',
      period: '2024',
      description: 'Coordinated communications with sponsors and participants for the annual tech fest. Managed sponsor relations and event publicity.'
    },
    {
      role: 'Cultural Participant',
      organization: 'Gokulashtami Fest',
      period: '2023',
      description: 'Represented CSE department in skit competition, securing third place among 50 teams. Demonstrated leadership and creative excellence.'
    }
  ];

  const publications = [
    {
      title: "AI's Influence on Gender Representation",
      authors: 'Ramya G.R, Vimal Harihar S K, Keshav S',
      status: 'Under Review',
      type: 'Research Paper'
    },
    {
      title: 'Personalized Nutrition for Alzheimer\'s',
      authors: 'Uma J, Bagavathi C, Vimal Harihar S K, Keshav S',
      status: 'Accepted',
      type: 'Book Chapter'
    },
    {
      title: 'SecureAI-Cyber: Cybersecurity Solution',
      authors: 'Ramya G.R, Vimal Harihar S K, Keshav S, Niharika V',
      status: 'Under Review',
      type: 'Research Paper'
    }
  ];

  return (
    <section className="experience-section" id="experience">
      <div className="experience-container">
        {/* Experience */}
        <div className="experience-subsection">
          <h2 className="section-title">Experience</h2>
          <div className="experience-timeline">
            {experiences.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3 className="experience-role">{exp.role}</h3>
                  <p className="experience-org">{exp.organization}</p>
                  {exp.period && <p className="experience-period">{exp.period}</p>}
                  <p className="experience-description">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publications */}
        <div className="publications-subsection">
          <h2 className="section-title">Research Publications</h2>
          <div className="publications-grid">
            {publications.map((pub, idx) => (
              <div key={idx} className="publication-card">
                <div className="publication-content">
                  <div className="publication-header">
                    <span className="publication-type">{pub.type}</span>
                    <span className={`publication-status ${pub.status === 'Accepted' ? 'accepted' : 'review'}`}>
                      {pub.status}
                    </span>
                  </div>
                  <h3 className="publication-title">{pub.title}</h3>
                  <p className="publication-authors">{pub.authors}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
