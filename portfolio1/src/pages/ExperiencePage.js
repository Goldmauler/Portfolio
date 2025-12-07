import React from 'react';
import Experience from '../components/Experience';
import GridScan from '../components/GridScan';

const ExperiencePage = () => {
  return (
    <div className="page" style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'auto' }}>
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor="#61dca3"
          gridScale={0.1}
          scanColor="#61b3dc"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
        <Experience />
      </div>
    </div>
  );
};

export default ExperiencePage;
