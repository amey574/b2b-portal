 'use client';
 
 import { useEffect, useRef, useState } from 'react';
 
 export default function AnimatedNumber({
   value,
   durationMs = 420,
   format = (n) => String(n),
 }) {
   const prevRef = useRef(null);
   const rafRef = useRef(null);
   const [display, setDisplay] = useState(() => (typeof value === 'number' ? value : null));
 
   useEffect(() => {
     if (typeof value !== 'number' || Number.isNaN(value)) {
       prevRef.current = value;
       setDisplay(null);
       return;
     }
 
     const from = typeof prevRef.current === 'number' ? prevRef.current : value;
     const to = value;
     prevRef.current = value;
 
     if (rafRef.current) cancelAnimationFrame(rafRef.current);
 
     const start = performance.now();
 
     const tick = (now) => {
       const t = Math.min(1, (now - start) / durationMs);
       // Ease-out cubic
       const eased = 1 - Math.pow(1 - t, 3);
       const next = from + (to - from) * eased;
       setDisplay(next);
       if (t < 1) rafRef.current = requestAnimationFrame(tick);
     };
 
     rafRef.current = requestAnimationFrame(tick);
 
     return () => {
       if (rafRef.current) cancelAnimationFrame(rafRef.current);
     };
   }, [value, durationMs]);
 
   if (display === null) return null;
 
   return format(display);
 }
