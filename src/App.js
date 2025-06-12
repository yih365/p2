import { useState, useEffect } from 'react';
import './App.css';
import LinkedInIcon from './components/LinkedInIcon';
import InkCursor from './components/InkCursor';
import RectanglePattern from './components/RectanglePattern';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const name = 'YIYI HUANG';
  const words = name.split(' ');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);
      
      // Toggle scrolled class on body
      if (scrollPosition > 100) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <InkCursor />
      <div className="app">
        <div className="content">
          <h1 className={`name ${scrollY > 100 ? 'scrolled' : ''}`}>
            {words.map((word, wordIndex) => {
              const letters = word.split('');
              return (
                <span key={wordIndex} className="word">
                  {letters.map((letter, letterIndex) => {
                    const isFirstLetter = letterIndex === 0;
                    const shouldShow = isFirstLetter || scrollY < 50;
                    return (
                      <span 
                        key={letterIndex} 
                        className={`letter ${!shouldShow ? 'hidden' : ''} ${isFirstLetter ? 'first-letter' : ''}`}
                      >
                        {letter}
                      </span>
                    );
                  })}
                  {wordIndex < words.length - 1 && ' '}
                </span>
              );
            })}
          </h1>
          <div className={`linkedin-container ${scrollY > 50 ? 'visible' : ''}`}>
            <LinkedInIcon />
          </div>
          <div className="scroll-indicator">
            <div className="scroll-line"></div>
          </div>
          <RectanglePattern scrollY={scrollY} />
        </div>
      </div>
    </>
  );
}

export default App;
