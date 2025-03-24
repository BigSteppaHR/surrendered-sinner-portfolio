
import React, { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connections: number[];
}

interface AnimatedBackgroundProps {
  children: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodesRef = useRef<Node[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initNodes();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const initNodes = () => {
      // Create 50 nodes
      nodesRef.current = [];
      for (let i = 0; i < 50; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          connections: []
        });
      }
    };

    const updateNodes = () => {
      const nodes = nodesRef.current;
      
      // Clear connections
      nodes.forEach(node => {
        node.connections = [];
      });
      
      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });
      
      // Find connections to mouse (max 3)
      let mouseConnections = 0;
      
      for (let i = 0; i < nodes.length && mouseConnections < 3; i++) {
        const dx = mouseRef.current.x - nodes[i].x;
        const dy = mouseRef.current.y - nodes[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 125) {
          nodes[i].connections.push(-1); // -1 indicates connection to mouse
          mouseConnections++;
        }
      }
      
      // Find connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            nodes[i].connections.push(j);
            nodes[j].connections.push(i);
          }
        }
      }
    };

    const drawNodes = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.lineWidth = 0.5;
      
      nodesRef.current.forEach((node, i) => {
        node.connections.forEach(j => {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          
          if (j === -1) {
            // Connection to mouse
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          } else {
            // Connection to another node
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.15)';
            ctx.lineTo(nodesRef.current[j].x, nodesRef.current[j].y);
          }
          
          ctx.stroke();
        });
      });
      
      // Draw nodes
      nodesRef.current.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.fill();
      });
    };

    const animate = () => {
      updateNodes();
      drawNodes();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black to-gray-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
