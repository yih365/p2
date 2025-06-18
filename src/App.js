import { useState, useEffect, useRef, useCallback } from 'react';
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

  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [letterWidths, setLetterWidths] = useState({ Y: 0, H: 0 });
  const [letterPositions, setLetterPositions] = useState({ 
    Y: { x: 0, y: 0 }, 
    H: { x: 0, y: 0 } 
  });
  const canvasRef = useRef(null);
  const nameRef = useRef(null);
  const letterRefs = useRef({ Y: null, H: null });

  // Measure text width using canvas
  const measureText = (text, font) => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };

  useEffect(() => {
    if (nameRef.current) {
      const computedStyle = window.getComputedStyle(nameRef.current);
      const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      
      setLetterWidths({
        Y: measureText('Y', font),
        H: measureText('H', font)
      });
      
      console.log('Letter widths:', {
        'Y': measureText('Y', font),
        'H': measureText('H', font)
      });
    }
  }, []);

  useEffect(() => {
    const updateCenter = () => {
      setCenter({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    };

    // Set initial center
    updateCenter();

    // Update on window resize
    window.addEventListener('resize', updateCenter);
    
    // Clean up
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

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
  // Phase 1: Fade out non-initial letters (0-100px)
  const fadeOutProgress = Math.min(Math.max(scrollY / 100, 0), 1);
  
  // Phase 2: Move initials together (100-400px)
  const moveTogetherProgress = Math.min(Math.max((scrollY - 100) / 300, 0), 1);
  
  const moveToCornerTime = 150;
  const moveToCornerPos = 250;
  const moveToCornerProgress = Math.min(Math.max((scrollY - moveToCornerPos) / moveToCornerTime, 0), 1);
  
  const isScrolled = scrollY > 100;
  const shouldBeInCorner = scrollY > moveToCornerPos;

  // Update letter positions when they change
  const updateLetterPositions = useCallback(() => {
    if (!letterRefs.current.Y || !letterRefs.current.H) return;
    
    const yRect = letterRefs.current.Y.getBoundingClientRect();
    const hRect = letterRefs.current.H.getBoundingClientRect();
    
    const newYPos = {
      x: yRect.left + window.scrollX + (yRect.width / 2),
      y: yRect.top + window.scrollY + (yRect.height / 2)
    };
    
    const newHPos = {
      x: hRect.left + window.scrollX + (hRect.width / 2),
      y: hRect.top + window.scrollY + (hRect.height / 2)
    };
    
    // Only update if positions changed significantly (more than 0.5px)
    if (
      Math.abs(newYPos.x - (letterPositions.Y?.x || 0)) > 0.5 ||
      Math.abs(newYPos.y - (letterPositions.Y?.y || 0)) > 0.5 ||
      Math.abs(newHPos.x - (letterPositions.H?.x || 0)) > 0.5 ||
      Math.abs(newHPos.y - (letterPositions.H?.y || 0)) > 0.5
    ) {
      setLetterPositions({
        Y: newYPos,
        H: newHPos
      });
    }
  }, [letterPositions]);
  
  // Update positions on scroll and resize with debounce
  useEffect(() => {
    let animationFrameId;
    
    const handleUpdate = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(updateLetterPositions);
    };
    
    // Initial update
    const timer = setTimeout(updateLetterPositions, 100);
    
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [updateLetterPositions]);
  
  // Set up refs
  const setYRef = useCallback((el) => {
    if (el) letterRefs.current.Y = el;
  }, []);
  
  const setHRef = useCallback((el) => {
    if (el) letterRefs.current.H = el;
  }, []);

  console.log("isRectangleHovered", isRectangleHovered);
  return (
    <>
      <InkCursor isRectHover={isRectangleHovered} className={isRectangleHovered ? 'rectangle-hover' : ''} />
      {/* Scroll indicator */}
      <div 
        className={`scroll-indicator ${scrollY > 150 ? 'hidden' : ''} ${scrollY > moveToCornerPos ? 'none' : ''}`}
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

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="app">
        <div className="content">
          <h1 
            ref={nameRef}
            className={`name ${isScrolled ? 'scrolled' : ''} ${shouldBeInCorner ? 'in-corner' : ''}`}
          >
            {words.map((word, wordIndex) => {
              const letters = word.split('');
              return (
                <span key={wordIndex} className="word">
                  {letters.map((char, letterIndex) => {
                    const isFirstLetter = letterIndex === 0;
                    const shouldShow = isFirstLetter || scrollY < 50;
                    if (!isFirstLetter) {
                      // Non-initial letters: fade out with scale
                      return (
                        <span 
                          key={letterIndex} 
                          className={`letter ${!shouldShow && !shouldBeInCorner ? 'hidden' : ''} ${shouldBeInCorner ? 'none' : ''}`}
                          style={{
                            opacity: 1 - fadeOutProgress,
                            transform: `scale(${1 - (fadeOutProgress * 0.5)})`,
                            transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                            // display: 'inline-block',
                            position: 'relative',
                            whiteSpace: 'pre'
                          }}
                        >
                          {char}
                        </span>
                      );
                    }
                    
                    // For initial letters: move together based on scroll
                    const finalSpacing = 2; // Final spacing in the corner
                    const direction = wordIndex === 0 ? -1 : 1;
                    let translateX = 0;
                    let translateY = 0;
                    let fontSize = '5rem';
                    
                    // Handle initial letters (Y and H)
                    if (isFirstLetter) {
                      const isY = wordIndex === 0;
                      const letterKey = isY ? 'Y' : 'H';
                      const letterWidth = letterWidths[letterKey] || 0;
                      let firstTargetPosition;
                      const currentPosition = letterPositions[letterKey] || 0;

                      // Phase 1: Stay in place while other letters fade out (0-100px)
                      // Phase 2: Move towards center (100-400px)
                      if (scrollY > 100 && scrollY < moveToCornerPos) {
                        firstTargetPosition = center.x + letterWidth*2;
                        
                        // Smooth transition between scroll positions
                        const scrollProgress = Math.min((scrollY - 100) / 140, 1); // Reduced from 300 to 200 for faster transition
                        translateX = (firstTargetPosition - currentPosition.x) * scrollProgress;
                      }
                      
                      if (scrollY > moveToCornerPos && scrollY < moveToCornerPos+moveToCornerTime) {
                        // const targetPosition = letterWidth;
                        // translateX += (targetPosition - currentPosition.x) * moveToCornerProgress;
                        // const targetPosY = letterWidth;
                        // translateY += (targetPosY - currentPosition.y) * moveToCornerProgress;
                        // console.log(translateX, translateY);
                        // const fontSizeNum = Math.min(Math.floor((5-2) / moveToCornerProgress), 5);
                        // console.log('fontSizeNum', fontSizeNum);
                        // fontSize = fontSizeNum.toString() + 'rem';
                        // console.log('fontSize', fontSize);
                      }
                    }
                    
                    const letterStyle = {
                      transform: `translate(${translateX}px, ${translateY}px)`,
                      transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                      display: 'inline-block',
                      position: 'relative',
                      transformOrigin: 'center center',
                      whiteSpace: 'pre',
                      // fontSize: fontSize,
                    };
                    
                    // Set ref for this letter if it's Y or H
                    const letter = isFirstLetter ? (wordIndex === 0 ? 'Y' : 'H') : null;
                    
                    return (
                      <span 
                        ref={isFirstLetter ? (wordIndex === 0 ? setYRef : setHRef) : null}
                        key={letterIndex} 
                        className={`letter ${!shouldShow ? 'hidden' : ''} ${isFirstLetter ? 'first-letter' : ''}`}
                        style={{
                          ...letterStyle,
                          willChange: 'transform',
                          backfaceVisibility: 'hidden'
                        }}
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
