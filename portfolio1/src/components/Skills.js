import React from 'react';
import './Skills.css';

const Skills = () => {
  const skillCategories = [
    {
      title: 'Programming Languages',
      skills: [
        { name: 'C++', level: 90 },
        { name: 'C', level: 85 },
        { name: 'Java', level: 80 },
        { name: 'JavaScript', level: 85 },
        { name: 'Python', level: 88 },
        { name: 'SQL', level: 82 },
        { name: 'Objective-C', level: 75 }
      ]
    },
    {
      title: 'Frameworks & Technologies',
      skills: [
        { name: 'MERN Stack', level: 85 },
        { name: 'Node.js', level: 88 },
        { name: '.NET', level: 75 },
        { name: 'TensorFlow', level: 80 },
        { name: 'OpenCV', level: 78 }
      ]
    },
    {
      title: 'Tools & Platforms',
      skills: [
        { name: 'Microsoft SQL Server', level: 80 },
        { name: 'XCode', level: 75 },
        { name: 'Arduino/IoT', level: 85 },
        { name: 'Git', level: 82 },
        { name: 'Interface Builder', level: 70 }
      ]
    },
    {
      title: 'Specializations',
      skills: [
        { name: 'Machine Learning', level: 85 },
        { name: 'IoT Systems', level: 88 },
        { name: 'Full Stack Development', level: 87 },
        { name: 'Data Structures', level: 90 }
      ]
    }
  ];

  return (
    <section className="skills-section" id="skills">
      <div className="skills-container">
        <h2 className="section-title">Skills & Expertise</h2>
        <div className="skills-grid">
          {skillCategories.map((category, idx) => (
            <div key={idx} className="skill-category">
              <h3 className="category-title">{category.title}</h3>
              <div className="skills-list">
                {category.skills.map((skill, skillIdx) => (
                  <div key={skillIdx} className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percentage">{skill.level}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
