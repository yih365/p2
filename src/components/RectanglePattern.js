import React, { useState, useEffect, useRef } from 'react';
import './RectanglePattern.css';

const RectanglePattern = ({ scrollY }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  
  // Generate rectangles with first one being special (with image)
  const generateRectangles = () => {
    const rectangles = [];
    const count = 5; // Total number of rectangles
    
    // First rectangle with image
    rectangles.push({
      id: 0,
      width: '300px',
      height: '300px',
      color: '#FFFFFF',
      hasImage: true,
      imageUrl: 'https://uploadthingy.s3.us-west-1.amazonaws.com/4PuzCWsTepyK4J4wSwcU4k/Gemini_Generated_Image_xgwo5uxgwo5uxgwo.png',
      link: 'https://www.aimmerse.app/',
      name: 'AImmerse',
      description: 'AI-Powered Immersive Experiences'
    });
    
    // Second rectangle - VideOrigami
    rectangles.push({
      id: 1,
      width: '300px',
      height: '300px',
      color: '#FFFFFF',
      hasImage: true,
      imageUrl: '/videoorigami.png',
      link: 'https://arxiv.org/abs/2503.04103v1',
      name: 'VideOrigami',
      description: 'Compositional Structures for Human-AI Collaboration'
    });
    
    return rectangles;
  };

  const [rectangles] = useState(generateRectangles());

  // Group rectangles into rows of max 3
  const groupIntoRows = (items, itemsPerRow) => {
    const rows = [];
    for (let i = 0; i < items.length; i += itemsPerRow) {
      rows.push(items.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const rows = groupIntoRows(rectangles, 3);
  
  // Add scroll margin to prevent content from being hidden behind fixed header
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .rectangle-pattern {
        scroll-margin-top: 80px; /* Adjust based on your header height */
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Show rectangles when name has reached top left
  useEffect(() => {
    // Show when scrolled past 50px (when name reaches top left)
    const shouldShow = scrollY > 50;
    
    if (shouldShow && !isVisible) {
      setIsVisible(true);
    } else if (!shouldShow && isVisible) {
      setIsVisible(false);
    }
  }, [scrollY, isVisible]);

  return (
    <div className={`rectangle-pattern ${isVisible ? 'visible' : ''}`} ref={containerRef}>
      <div className="pattern-container">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="pattern-row">
            {row.map(rect => (
              <div 
                key={rect.id}
                className="pattern-rectangle"
                style={{
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: rect.color,
                  ...(rect.hasImage && { 
                    backgroundImage: `url(${rect.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  })
                }}
                onClick={() => rect.link && window.open(rect.link, '_blank')}
              >
                <div className="rectangle-overlay">
                  <h3 className="project-name">{rect.name}</h3>
                  <p className="project-description">{rect.description}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RectanglePattern;
