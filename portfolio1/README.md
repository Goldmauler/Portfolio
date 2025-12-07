# Portfolio

A modern, animated portfolio website built with React and the LetterGlitch component.

## Features

- 🎨 Animated glitch background effect
- 📱 Fully responsive design
- 🎯 Smooth scrolling navigation
- 💼 Portfolio sections: Hero, About, Skills, Projects, Contact
- ⚡ Modern UI with gradient effects
- 🎭 Interactive animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Customization

### Update Your Information

Edit the following files to add your personal information:

- `src/components/Hero.js` - Your name and title
- `src/components/About.js` - About section and stats
- `src/components/Skills.js` - Your skills and expertise
- `src/components/Projects.js` - Your projects
- `src/components/Contact.js` - Contact information

### Customize Colors

The main color scheme uses:

- Primary: `#61dca3` (Green)
- Secondary: `#61b3dc` (Blue)
- Background: `#000000` (Black)

You can modify these in the CSS files.

### LetterGlitch Configuration

Customize the background effect in `src/App.js`:

```javascript
<LetterGlitch
  glitchSpeed={50} // Speed of glitch animation
  centerVignette={true} // Dark center vignette
  outerVignette={false} // Dark outer vignette
  smooth={true} // Smooth color transitions
  glitchColors={["#1a1a1a", "#2b4539", "#1a2a3a"]}
/>
```

## Project Structure

```
Portfolio/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── LetterGlitch.js
│   │   ├── Hero.js
│   │   ├── Hero.css
│   │   ├── About.js
│   │   ├── About.css
│   │   ├── Skills.js
│   │   ├── Skills.css
│   │   ├── Projects.js
│   │   ├── Projects.css
│   │   ├── Contact.js
│   │   └── Contact.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Technologies Used

- React 18
- CSS3
- HTML5 Canvas (for glitch effect)

## License

MIT License - feel free to use this for your own portfolio!

## Credits

LetterGlitch component inspired by @react-bits
