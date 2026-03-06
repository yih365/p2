import React, { useEffect, useRef, useState, useCallback } from 'react';
import './InkCursor.css';

const amount = 20;
const sineDots = Math.floor(amount * 0.3);
const width = 26;
const idleTimeout = 150;

class Dot {
  constructor(index, mousePosition, cursorElement) {
    this.index = index;
    this.anglespeed = 0.05;
    this.x = mousePosition.x;
    this.y = mousePosition.y;
    this.scale = 1 - 0.05 * index;
    this.range = width / 2 - (width / 2) * this.scale + 2;
    this.limit = width * 0.75 * this.scale;
    this.element = document.createElement("span");
    this.element.style.width = `${width}px`;
    this.element.style.height = `${width}px`;
    this.element.style.position = 'absolute';
    this.element.style.borderRadius = '50%';
    this.element.style.backgroundColor = 'white';
    this.element.style.pointerEvents = 'none';
    this.element.style.willChange = 'transform';

    if (cursorElement) {
      cursorElement.appendChild(this.element);
    }
  }

  lock() {
    this.lockX = this.x;
    this.lockY = this.y;
    this.angleX = Math.PI * 2 * Math.random();
    this.angleY = Math.PI * 2 * Math.random();
  }

  draw(idle) {
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

const InkCursor = ({ isRectHover }) => {
  const cursorRef = useRef(null);
  const dotsRef = useRef([]);
  const [isVisible, setIsVisible] = useState(false);
  const isRectHoverRef = useRef(isRectHover);
  const lastFrameRef = useRef(0);
  const mousePositionRef = useRef({ x: -100, y: -100 });
  const timeoutIDRef = useRef(null);
  const idleRef = useRef(false);

  useEffect(() => {
    isRectHoverRef.current = isRectHover;
  }, [isRectHover]);

  const goInactive = useCallback(() => {
    idleRef.current = true;
    dotsRef.current.forEach(dot => dot.lock());
  }, []);

  const startIdleTimer = useCallback(() => {
    timeoutIDRef.current = setTimeout(goInactive, idleTimeout);
    idleRef.current = false;
  }, [goInactive]);

  const resetIdleTimer = useCallback(() => {
    clearTimeout(timeoutIDRef.current);
    startIdleTimer();
  }, [startIdleTimer]);

  const onMouseMove = useCallback((e) => {
    mousePositionRef.current.x = e.clientX - width / 2;
    mousePositionRef.current.y = e.clientY - width / 2;
    setIsVisible(true);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const positionCursor = useCallback(() => {
    let x = mousePositionRef.current.x;
    let y = mousePositionRef.current.y;
    dotsRef.current.forEach((dot, index, dots) => {
      let nextDot = dots[index + 1] || dots[0];
      dot.x = x;
      dot.y = y;

      // Apply hover effect
      if (isRectHoverRef.current) {
        dot.element.style.mixBlendMode = 'difference';
      } else {
        dot.element.style.mixBlendMode = 'normal';
      }

      dot.draw(idleRef.current);
      if (!idleRef.current || index <= sineDots) {
        const dx = (nextDot.x - dot.x) * 0.35;
        const dy = (nextDot.y - dot.y) * 0.35;
        x += dx;
        y += dy;
      }
    });
  }, []);

  const render = useCallback((timestamp) => {
    const delta = timestamp - lastFrameRef.current;
    if (delta > 0) {
      positionCursor();
      lastFrameRef.current = timestamp;
    }
    requestAnimationFrame(render);
  }, [positionCursor]);

  useEffect(() => {
    if (isVisible && cursorRef.current) {
      const dots = [];
      for (let i = 0; i < amount; i++) {
        dots.push(new Dot(i, mousePositionRef.current, cursorRef.current));
      }
      dotsRef.current = dots;
      lastFrameRef.current = performance.now();

      const rafId = requestAnimationFrame(render);
      window.addEventListener('mousemove', onMouseMove);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(rafId);
        if (dotsRef.current) {
          dotsRef.current.forEach(dot => {
            if (dot.element && dot.element.parentNode) {
              dot.element.parentNode.removeChild(dot.element);
            }
          });
        }
      };
    }
  }, [isVisible, onMouseMove, render]);

  if (!isVisible) {
    return (
      <div
        onMouseMove={onMouseMove}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}
      />
    );
  }

  return (
    <>
      <div
        id="cursor"
        ref={cursorRef}
        className="ink-cursor"
      ></div>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default InkCursor;