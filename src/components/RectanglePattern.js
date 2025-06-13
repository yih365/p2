import React, { useState, useEffect, useRef } from 'react';
import './RectanglePattern.css';

const ProjectModal = ({ project, onClose, originRect }) => {
  if (!project) return null;

  // Determine button text based on project name
  const getButtonText = () => {
    if (project.name.toLowerCase().includes('aimmerse')) return 'See web app';
    if (project.name.toLowerCase().includes('videorigami')) return 'See paper';
    return 'View Project';
  };

  return (
    <div className={`project-modal-overlay ${project ? 'visible' : ''}`} onClick={onClose}>
      <div 
        className="project-modal" 
        onClick={e => e.stopPropagation()}
        style={originRect ? {
          '--origin-x': `${originRect.left + originRect.width / 2}px`,
          '--origin-y': `${originRect.top + originRect.height / 2}px`,
          '--origin-width': `${originRect.width}px`,
          '--origin-height': `${originRect.height}px`
        } : {}}
      >
        <div className="project-modal-content">
          <div className="project-modal-details">
            {project.name && <h1 className="project-title">{project.name}</h1>}
            {project.description && <p className="project-caption">{project.description}</p>}
            {project.link && (
              <div className="project-actions">
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="project-link"
                  onClick={e => e.stopPropagation()}
                >
                  {getButtonText()}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RectanglePattern = ({ scrollY }) => {
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
        details: 'A platform that leverages AI to create immersive experiences. Built with React, Node.js, and Three.js. Features include real-time 3D rendering, AI-powered content generation, and interactive user interfaces.'
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
        details: 'A research project exploring new paradigms for human-AI collaboration in video editing. Implements novel algorithms for content-aware video manipulation and composition.'
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
                className={`pattern-rectangle ${selectedProject?.id === rect.id ? 'expanding' : ''}`}
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
