import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import LetterGlitch from './components/LetterGlitch';
import FaultyTerminal from './components/FaultyTerminal';
import StaggeredMenu from './components/StaggeredMenu';
import SplineBackground from './components/SplineBackground';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import SkillsPage from './pages/SkillsPage';
import ExperiencePage from './pages/ExperiencePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';

function BackgroundSelector() {
  const location = useLocation();

  if (location.pathname === '/about') {
    return (
      <div className="background-glitch interactive">
        <FaultyTerminal
          scale={1.5}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={1}
          pause={false}
          scanlineIntensity={1}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0}
          tint="#61dca3"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={1}
        />
      </div>
    );
  }

  if (location.pathname === '/skills') {
    return null;
  }

  if (location.pathname === '/experience' || location.pathname === '/projects') {
    return null;
  }

  if (location.pathname === '/contact') {
    return (
      <div className="background-glitch">
        <SplineBackground scene="https://prod.spline.design/VNA803c-SXFV2efK/scene.splinecode" />
      </div>
    );
  }

  return (
    <div className="background-glitch">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={false}
        outerVignette={true}
        smooth={true}
        glitchColors={['#2b4539', '#61dca3', '#61b3dc']}
        characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789"
      />
    </div>
  );
}

function App() {
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about me', link: '/about' },
    { label: 'Skills', ariaLabel: 'View my skills', link: '/skills' },
    { label: 'Experience', ariaLabel: 'See my experience', link: '/experience' },
    { label: 'Projects', ariaLabel: 'View my projects', link: '/projects' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'Twitter', link: 'https://twitter.com' }
  ];

  return (
    <Router>
      <div className="App">
        {/* FaultyTerminal always on About page, above all except footer */}
        {/* Background Effects - Changes based on route */}
        <BackgroundSelector />

        {/* Staggered Menu Navigation */}
        <StaggeredMenu
          position="right"
          items={menuItems}
          socialItems={socialItems}
          displaySocials={true}
          displayItemNumbering={true}
          menuButtonColor="#fff"
          openMenuButtonColor="#000"
          changeMenuColorOnOpen={true}
          colors={['#61dca3', '#61b3dc']}
          accentColor="#61dca3"
          onMenuOpen={() => console.log('Menu opened')}
          onMenuClose={() => console.log('Menu closed')}
        />

        {/* Background Effects - Changes based on route */}
        <BackgroundSelector />

        {/* Navigation - Hidden when StaggeredMenu is used */}
        {/* <Navigation /> */}

        {/* Main Content with Routes */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-top">
              <div className="footer-brand">
                <h3 className="footer-brand-title">Vimal Harihar</h3>
                <p className="footer-brand-tagline">AI & ML Engineer | Full Stack Developer</p>
              </div>
              <div className="footer-links">
                <div className="footer-column">
                  <h4>Navigation</h4>
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/skills">Skills</a></li>
                    <li><a href="/experience">Experience</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Projects</h4>
                  <ul>
                    <li><a href="/projects">View All</a></li>
                    <li><a href="/contact">Contact</a></li>
                  </ul>
                </div>
                <div className="footer-column">
                  <h4>Connect</h4>
                  <ul className="footer-social">
                    <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                    <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                    <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="footer-divider"></div>
            <div className="footer-bottom">
              <div className="footer-location">
                <span className="location-icon">📍</span>
                <span className="location-text">Coimbatore, India</span>
              </div>
              <div className="footer-tags">
                <span className="footer-tag">AI & ML</span>
                <span className="footer-tag">Full Stack</span>
                <span className="footer-tag">IoT Systems</span>
                <span className="footer-tag">Research</span>
              </div>
              <p className="footer-copyright">&copy; 2025 Vimal Harihar. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
