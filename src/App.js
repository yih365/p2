import { useState, useEffect } from 'react';
import './App.css';
import './ScrollIndicator.css';
import LinkedInIcon from './components/LinkedInIcon';
import InkCursor from './components/InkCursor';
import RectanglePattern from './components/RectanglePattern';
import { FaChevronDown } from 'react-icons/fa';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isRectangleHovered, setIsRectangleHovered] = useState(false);
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

  // Calculate scroll progress for smoother transitions
  // Phase 1: Fade out non-initial letters (0-50px)
  const fadeOutProgress = Math.min(Math.max(scrollY / 50, 0), 1);
  
  // Phase 2: Move initials together (50-150px)
  const moveTogetherProgress = Math.min(Math.max((scrollY - 50) / 100, 0), 1);
  
  // Phase 3: Move to corner (starts at 150px)
  const moveToCornerProgress = Math.min(Math.max((scrollY - 150) / 50, 0), 1);
  
  const isScrolled = scrollY > 50;
  const shouldBeInCorner = scrollY > 150;
  
  return (
    <>
      <InkCursor className={isRectangleHovered ? 'rectangle-hover' : ''} />
      {/* Scroll indicator */}
      <div 
        className={`scroll-indicator ${scrollY > 150 ? 'hidden' : ''}`}
        style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#000',
          zIndex: 1000,
          opacity: scrollY < 150 ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: 'none'
        }}
      >
        <FaChevronDown className="bounce" style={{ fontSize: '24px' }} />
      </div>

      <div className="app">
        <div className="content">
          <h1 className={`name ${isScrolled ? 'scrolled' : ''} ${shouldBeInCorner ? 'in-corner' : ''}`}>
            {words.map((word, wordIndex) => {
              const letters = word.split('');
              return (
                <span key={wordIndex} className="word">
                  {letters.map((letter, letterIndex) => {
                    const isFirstLetter = letterIndex === 0;
                    const shouldShow = isFirstLetter || scrollY < 50;
                    if (!isFirstLetter) {
                      // Non-initial letters: fade out with scale
                      return (
                        <span 
                          key={letterIndex} 
                          className={`letter ${!shouldShow ? 'hidden' : ''}`}
                          style={{
                            opacity: 1 - fadeOutProgress,
                            transform: `scale(${1 - (fadeOutProgress * 0.5)})`,
                            transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
                          }}
                        >
                          {letter}
                        </span>
                      );
                    }
                    
                    // For initial letters: move together based on scroll
                    const moveDistance = 30; // How far to move towards center
                    const finalSpacing = 8; // Final spacing in the corner
                    const direction = wordIndex === 0 ? -1 : 1;
                    let translateX = 0;
                    
                    // // Phase 1: Stay in place (50-100px)
                    // if (scrollY > 50) {
                    //   // Start moving only after 100px of scroll
                    //   const delayProgress = Math.min(Math.max((scrollY - 100) / 100, 0), 1);
                    //   // Start at full distance, move to center only after delay
                    //   translateX = (direction * moveDistance) * (1 - delayProgress);
                    // }
                    
                    // Phase 2: Move to corner (starts at 150px)
                    // else if (scrollY > 250) {
                    //   console.log("moving to corner");
                    //   // Move to final corner position
                    //   const cornerOffset = direction * finalSpacing;
                    //   // Start from center (0) and move to corner offset
                    //   translateX = cornerOffset * moveToCornerProgress;
                    // }
                    
                    const letterStyle = {
                      transform: `translateX(${translateX}px)`,
                      transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
                    };
                    
                    return (
                      <span 
                        key={letterIndex} 
                        className={`letter ${!shouldShow ? 'hidden' : ''} ${isFirstLetter ? 'first-letter' : ''}`}
                        style={letterStyle}
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
          <RectanglePattern 
            scrollY={scrollY} 
            onRectangleHover={setIsRectangleHovered} 
          />
        </div>
      </div>
    </>
  );
}

export default App;
