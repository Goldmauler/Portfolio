import React from 'react';
import Spline from '@splinetool/react-spline';
import './SplineBackground.css';

const SplineBackground = ({ scene = 'https://prod.spline.design/VNA803c-SXFV2efK/scene.splinecode' }) => {
  return (
    <div className="spline-background">
      <Spline scene={scene} />
    </div>
  );
};

export default SplineBackground;
