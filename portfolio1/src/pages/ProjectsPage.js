import React from 'react';
import Projects from '../components/Projects';
import PrismaticBurst from '../components/PrismaticBurst';

const ProjectsPage = () => {
  return (
    <div className="page" style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}>
        <PrismaticBurst
          animationType="rotate3d"
          intensity={2}
          speed={0.5}
          distort={1.0}
          paused={false}
          offset={{ x: 0, y: 0 }}
          hoverDampness={0.25}
          rayCount={24}
          mixBlendMode="lighten"
          colors={['#61dca3', '#61b3dc', '#ffffff']}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <Projects />
      </div>
    </div>
  );
};

export default ProjectsPage;
