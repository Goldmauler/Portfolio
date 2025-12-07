import React from 'react';
import Skills from '../components/Skills';
import Dither from '../components/Dither';

const SkillsPage = () => {
  return (
    <div className="page" style={{ position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}>
        <Dither
          waveColor={[0.38, 0.86, 0.64]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <Skills />
      </div>
    </div>
  );
};

export default SkillsPage;
