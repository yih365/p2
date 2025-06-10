import React, { useEffect, useRef } from 'react';
import './InkCursor.css';

const InkCursor = () => {
  const cursorRef = useRef(null);
  const dotsRef = useRef([]);
  const amount = 20;
  const sineDots = Math.floor(amount * 0.3);
  const width = 26;
  const idleTimeout = 150;
  let lastFrame = 0;
  let mousePosition = { x: 0, y: 0 };
  let timeoutID;
  let idle = false;

  class Dot {
    constructor(index = 0) {
      this.index = index;
      this.anglespeed = 0.05;
      this.x = 0;
      this.y = 0;
      this.scale = 1 - 0.05 * index;
      this.range = width / 2 - (width / 2) * this.scale + 2;
      this.limit = width * 0.75 * this.scale;
      this.element = document.createElement("span");
      this.element.style.width = `${width}px`;
      this.element.style.height = `${width}px`;
      cursorRef.current.appendChild(this.element);
    }

    lock() {
      this.lockX = this.x;
      this.lockY = this.y;
      this.angleX = Math.PI * 2 * Math.random();
      this.angleY = Math.PI * 2 * Math.random();
    }

    draw(delta) {
      if (!idle || this.index <= sineDots) {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
      } else {
        this.angleX += this.anglespeed;
        this.angleY += this.anglespeed;
        this.y = this.lockY + Math.sin(this.angleY) * this.range;
        this.x = this.lockX + Math.sin(this.angleX) * this.range;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
      }
    }
  }


  const onMouseMove = (e) => {
    mousePosition.x = e.clientX - width / 2;
    mousePosition.y = e.clientY - width / 2;
    resetIdleTimer();
  };

  const onTouchMove = (e) => {
    mousePosition.x = e.touches[0].clientX - width / 2;
    mousePosition.y = e.touches[0].clientY - width / 2;
    resetIdleTimer();
  };

  const startIdleTimer = () => {
    timeoutID = setTimeout(goInactive, idleTimeout);
    idle = false;
  };

  const resetIdleTimer = () => {
    clearTimeout(timeoutID);
    startIdleTimer();
  };

  const goInactive = () => {
    idle = true;
    dotsRef.current.forEach(dot => dot.lock());
  };

  const positionCursor = (delta) => {
    let x = mousePosition.x;
    let y = mousePosition.y;
    dotsRef.current.forEach((dot, index, dots) => {
      let nextDot = dots[index + 1] || dots[0];
      dot.x = x;
      dot.y = y;
      dot.draw(delta);
      if (!idle || index <= sineDots) {
        const dx = (nextDot.x - dot.x) * 0.35;
        const dy = (nextDot.y - dot.y) * 0.35;
        x += dx;
        y += dy;
      }
    });
  };

  const render = (timestamp) => {
    const delta = timestamp - lastFrame;
    positionCursor(delta);
    lastFrame = timestamp;
    requestAnimationFrame(render);
  };

  useEffect(() => {
    // Create dots
    const dots = [];
    for (let i = 0; i < amount; i++) {
      dots.push(new Dot(i));
    }
    dotsRef.current = dots;
    lastFrame = performance.now();
    
    // Start animation
    requestAnimationFrame(render);
    
    // Add event listeners
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    
    // Initial position
    mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef} className="ink-cursor"></div>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default InkCursor;
