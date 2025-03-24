
import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connectedToCursor: boolean;
}

const AnimatedBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const cursorConnectionsRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Track cursor position
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize nodes
    const initNodes = () => {
      const nodeCount = 15; // More nodes for more connections
      const nodes: Node[] = [];

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5, // Slower movement
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          color: `rgba(255, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, ${0.2 + Math.random() * 0.3})`,
          connectedToCursor: false
        });
      }

      nodesRef.current = nodes;
    };

    // Draw functions
    const drawNodes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // First update positions
      nodesRef.current.forEach(node => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off walls
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Reset cursor connection
        node.connectedToCursor = false;
      });

      // Reset cursor connections counter
      cursorConnectionsRef.current = 0;

      // Draw connections to cursor (max 3)
      nodesRef.current
        .sort((a, b) => {
          const distA = Math.hypot(a.x - cursorRef.current.x, a.y - cursorRef.current.y);
          const distB = Math.hypot(b.x - cursorRef.current.x, b.y - cursorRef.current.y);
          return distA - distB;
        })
        .forEach(node => {
          const dx = node.x - cursorRef.current.x;
          const dy = node.y - cursorRef.current.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 125 && cursorConnectionsRef.current < 3) {
            // Connect to cursor
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(cursorRef.current.x, cursorRef.current.y);
            ctx.strokeStyle = `rgba(255, 50, 50, ${1 - distance / 125})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
            node.connectedToCursor = true;
            cursorConnectionsRef.current++;
          }
        });

      // Draw connections between nodes
      for (let i = 0; i < nodesRef.current.length; i++) {
        const nodeA = nodesRef.current[i];
        
        // Draw the node
        ctx.beginPath();
        ctx.arc(nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeA.connectedToCursor ? 'rgba(255, 0, 0, 0.8)' : nodeA.color;
        ctx.fill();

        // Connect to other nodes
        for (let j = i + 1; j < nodesRef.current.length; j++) {
          const nodeB = nodesRef.current[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(255, 30, 30, ${0.1 - distance / 1000})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(drawNodes);
    };

    initNodes();
    drawNodes();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to bottom, #000000, #1a0000)' }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default AnimatedBackground;
