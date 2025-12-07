import React from 'react';
import './Experience.css';

const Experience = () => {
  const experiences = [
    {
      role: 'Undergraduate Researcher',
      organization: 'Amrita Vishwa Vidyapeetham',
      period: 'Ongoing',
      description: 'Co-authored research papers in AI, Smart Systems, and IoT. Contributed to literature review and experimental design.'
    },
    {
      role: 'Core Member',
      organization: 'MUNSOC Club, Amrita Vishwa Vidyapeetham',
      period: '',
      description: 'Organized Model UN events and moderated simulations. Improved club engagement through feedback initiatives.'
    },
    {
      role: 'Public Relations Volunteer',
      organization: 'Anokha Tech Fest, Amrita Vishwa Vidyapeetham',
      period: '',
      description: 'Coordinated communications with sponsors and participants for the annual tech fest.'
    },
    {
      role: 'Cultural Participant',
      organization: 'Gokulashtami Fest',
      period: '',
      description: 'Represented CSE department in skit competition, securing third place among 50 teams.'
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
