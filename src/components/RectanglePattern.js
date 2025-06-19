import React, { useState, useEffect, useRef } from 'react';
import './RectanglePattern.css';

const ProjectModal = ({ project, onClose, originRect }) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);

  if (!project) return null;

  // Determine button text based on project name
  const getButtonText = () => {
    if (project.name.toLowerCase().includes('aimmerse')) return 'See web app';
    if (project.name.toLowerCase().includes('videorigami')) return 'See paper';
    return 'View Project';
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (isClosing) return;
    
    setIsClosing(true);
    // Wait for the animation to complete before calling onClose
    setTimeout(() => {
      onClose();
      // Reset the closing state after the modal is fully closed
      setTimeout(() => setIsClosing(false), 0);
    }, 300); // Match this with the CSS animation duration
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  return (
    <div 
      className={`project-modal-overlay ${project ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        ref={modalRef}
        className="project-modal" 
        onClick={e => e.stopPropagation()}
        style={originRect ? {
          '--origin-x': `${originRect.left + originRect.width / 2}px`,
          '--origin-y': `${originRect.top + originRect.height / 2}px`,
          '--origin-width': `${originRect.width}px`,
          '--origin-height': `${originRect.height}px`
        } : {}}
      >
        <button 
          className={`close-button ${isClosing ? 'closing' : ''}`} 
          onClick={handleClose} 
          aria-label="Close"
          disabled={isClosing}
        ></button>
        <div className="project-modal-content">
          <div className="project-modal-details">
            {project.name && <h1 className="project-title">{project.name}</h1>}
            {project.description && <p className="project-caption">{project.description}</p>}
            {project.tags && project.tags.length > 0 && (
              <div className="project-tags">
                {project.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
            {project.link && (
              <div className="project-actions">
                <div className="button-borders">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="project-link primary-button"
                    onClick={e => e.stopPropagation()}
                  >
                    {getButtonText()}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RectanglePattern = ({ scrollY, onRectangleHover }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const containerRef = useRef(null);
  const rectRefs = useRef({});
  
  // Generate rectangles with project details
  const generateRectangles = () => {
    return [
      {
        id: 0,
        width: '300px',
        height: '300px',
        color: '#FFFFFF',
        hasImage: true,
        imageUrl: 'https://uploadthingy.s3.us-west-1.amazonaws.com/4PuzCWsTepyK4J4wSwcU4k/Gemini_Generated_Image_xgwo5uxgwo5uxgwo.png',
        link: 'https://www.aimmerse.app/',
        name: 'AImmerse',
        description: 'AI-Powered Immersive Experiences',
        details: 'A platform that leverages AI to create immersive experiences. Built with React, Node.js, and Three.js. Features include real-time 3D rendering, AI-powered content generation, and interactive user interfaces.',
        tags: ['Web']
      },
      {
        id: 1,
        width: '300px',
        height: '300px',
        color: '#FFFFFF',
        hasImage: true,
        imageUrl: '/videoorigami.png',
        link: 'https://arxiv.org/abs/2503.04103v1',
        name: 'VideOrigami',
        description: 'Compositional Structures for Human-AI Collaboration',
        details: 'A research project exploring new paradigms for human-AI collaboration in video editing. Implements novel algorithms for content-aware video manipulation and composition.',
        tags: ['HCI', 'Research', 'Web']
      },
      // {
      //   id: 2,
      //   width: '300px',
      //   height: '300px',
      //   color: '#FFFFFF',
      //   hasImage: true,
      //   imageUrl: '/drawrefgen.png',
      //   link: 'https://github.com/yih365/draw-refgen',
      //   name: 'Draw RefGen',
      //   description: 'Drawing tool using generated inspirations',
      //   details: 'An innovative drawing tool that generates creative inspirations using AI',
      //   tags: []
      // },
      {
        id: 3,
        width: '400px',
        height: '300px',
        color: '#FFFFFF',
        hasImage: true,
        imageUrl: '/PomoReflect.png',
        link: 'https://github.com/yih365/PomoReflect',
        name: 'PomoReflect',
        description: 'An updated Pomodoro IOS App',
        tags: ['Mobile', 'iOS']
      }
    ];
  };

  const [rectangles] = useState(generateRectangles());
  
  const handleProjectClick = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    const rectEl = rectRefs.current[project.id];
    if (rectEl) {
      const rect = rectEl.getBoundingClientRect();
      console.log('Rectangle position:', rect);
      console.log('Project data:', project);
      setOriginRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      });
      // Small delay to allow state to update before showing modal
      requestAnimationFrame(() => {
        setSelectedProject(project);
      });
    } else {
      setSelectedProject(project);
    }
  };
  
  const closeModal = () => {
    setSelectedProject(null);
    setOriginRect(null);
  };

  // Group rectangles into rows with different max items per row
  const groupIntoRows = (items) => {
    const rows = [];
    // First row: max 2 items
    rows.push(items.slice(0, 2));
    // Second row: max 1 item
    rows.push(items.slice(2, 3));
    // Third row: max 3 items
    rows.push(items.slice(3, 6));
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
    <>
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={closeModal} 
          originRect={originRect}
        />
      )}
      <div className={`rectangle-pattern ${isVisible ? 'visible' : ''}`} ref={containerRef}>
      <div className="pattern-container">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="pattern-row">
            {row.map(rect => (
              <div
                key={rect.id}
                ref={el => rectRefs.current[rect.id] = el}
                className="pattern-rectangle"
                onMouseEnter={() => {onRectangleHover && onRectangleHover(true); console.log('Rectangle hover');}}
                onMouseLeave={() => {onRectangleHover && onRectangleHover(false); console.log("rectangle unhovered")}}
                style={{
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: rect.color,
                  cursor: 'none', // Ensure default cursor is hidden
                  ...(rect.hasImage && {
                    backgroundImage: `url(${rect.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  })
                }}
                onClick={(e) => handleProjectClick(e, rect)}
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
    </>
  );
};

export default RectanglePattern;
