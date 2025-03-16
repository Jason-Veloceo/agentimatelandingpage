// Animation for the flowing line in the input box
const initInputAnimation = () => {
  // Create canvas for the animation
  const createCanvas = () => {
    const canvas = document.createElement('canvas');
    canvas.classList.add('input-animation-canvas');
    return canvas;
  };

  // Setup the animation container
  const setupAnimationContainer = (inputContainer) => {
    // Check if animation container already exists
    let animationContainer = inputContainer.querySelector('.input-animation-container');
    
    if (!animationContainer) {
      animationContainer = document.createElement('div');
      animationContainer.classList.add('input-animation-container');
      
      // Insert the animation container before the textarea in the input container
      inputContainer.insertBefore(animationContainer, inputContainer.firstChild);
    }
    
    return animationContainer;
  };

  // Initialize the canvas and context
  const initCanvas = (container) => {
    // Check if canvas already exists
    let canvas = container.querySelector('.input-animation-canvas');
    
    if (!canvas) {
      canvas = createCanvas();
      container.appendChild(canvas);
    }
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return { canvas, ctx, resizeCanvas };
  };

  // Create the flowing line animation
  const createFlowingLineAnimation = (ctx, canvas) => {
    // Animation parameters
    const params = {
      numPoints: 3,
      lineWidth: 2,
      maxAmplitude: 30,
      curveSegments: 100,
      particleSize: 1,
      glowSize: 12,
      glowOpacity: 0.8
    };
    
    const points = [];
    
    // Initialize points
    const initPoints = () => {
      points.length = 0;
      for (let i = 0; i < params.numPoints; i++) {
        points.push({
          x: canvas.width * (i / (params.numPoints - 1)),
          y: canvas.height / 2,
          originalY: canvas.height / 2,
          speed: 0.001 + Math.random() * 0.002,
          amplitude: params.maxAmplitude * 0.5 + Math.random() * params.maxAmplitude * 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    };
    
    initPoints();
    
    // Create gradient
    const createGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#ff7a7a');
      gradient.addColorStop(0.5, '#7a91ff');
      gradient.addColorStop(1, '#7affe0');
      return gradient;
    };
    
    // Draw the flowing line
    const drawFlowingLine = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update points
      points.forEach((point, i) => {
        if (i !== 0 && i !== points.length - 1) {
          point.y = point.originalY + Math.sin(time * point.speed + point.phase) * point.amplitude;
        }
      });
      
      // Draw curve
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Draw curve segments
      for (let i = 0; i < params.curveSegments; i++) {
        const t = i / params.curveSegments;
        const x = bezierPoint(t, points.map(p => p.x));
        const y = bezierPoint(t, points.map(p => p.y));
        ctx.lineTo(x, y);
      }
      
      // Style and stroke the path
      ctx.strokeStyle = createGradient();
      ctx.lineWidth = params.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Draw circle at the middle point
      const middlePoint = {
        x: bezierPoint(0.5, points.map(p => p.x)),
        y: bezierPoint(0.5, points.map(p => p.y))
      };
      
      ctx.beginPath();
      ctx.arc(middlePoint.x, middlePoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#7a91ff';
      ctx.fill();
      
      // Draw glow effect
      ctx.beginPath();
      ctx.arc(middlePoint.x, middlePoint.y, params.glowSize, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(
        middlePoint.x, middlePoint.y, 0,
        middlePoint.x, middlePoint.y, params.glowSize
      );
      glowGradient.addColorStop(0, `rgba(122, 145, 255, ${params.glowOpacity})`);
      glowGradient.addColorStop(1, 'rgba(122, 145, 255, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // Add floating particles
      drawParticles(time, middlePoint);
    };
    
    // Draw floating particles around the line
    const particles = [];
    const numParticles = 15;
    
    // Initialize particles
    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: params.particleSize + Math.random() * 3,
          speed: 0.5 + Math.random() * 1,
          angle: Math.random() * Math.PI * 2,
          color: [
            '#ff7a7a',
            '#7a91ff',
            '#7affe0'
          ][Math.floor(Math.random() * 3)],
          opacity: 0.3 + Math.random() * 0.5
        });
      }
    };
    
    initParticles();
    
    const drawParticles = (time, centerPoint) => {
      particles.forEach(particle => {
        // Update particle position
        particle.angle += particle.speed * 0.01;
        particle.x = centerPoint.x + Math.cos(particle.angle) * (30 + Math.sin(time * 0.001) * 10);
        particle.y = centerPoint.y + Math.sin(particle.angle) * (20 + Math.cos(time * 0.001) * 10);
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    };
    
    // Helper function for bezier curve calculation
    const bezierPoint = (t, points) => {
      const n = points.length - 1;
      let result = 0;
      
      for (let i = 0; i <= n; i++) {
        result += binomialCoefficient(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i) * points[i];
      }
      
      return result;
    };
    
    const binomialCoefficient = (n, k) => {
      let result = 1;
      
      for (let i = 1; i <= k; i++) {
        result *= (n - (k - i));
        result /= i;
      }
      
      return result;
    };
    
    // Animation loop
    let animationFrameId;
    const animate = (time) => {
      drawFlowingLine(time);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate(0);
    
    // Function to modify animation parameters
    const modifyAnimation = (command) => {
      if (command === 'bigger' || command === 'glow') {
        // More dramatic effect for bigger/glow
        params.lineWidth = 4;
        params.glowSize = 25;
        params.glowOpacity = 1;
        params.maxAmplitude = 50;
        params.particleSize = 2.5;
        
        // Change the particle colors to brighter ones
        particles.forEach(particle => {
          particle.color = ['#ff9a9a', '#9ab1ff', '#9affe0'][Math.floor(Math.random() * 3)];
          particle.opacity = 0.7 + Math.random() * 0.3;
          particle.size = params.particleSize + Math.random() * 3;
        });
        
        // Reset after a delay
        setTimeout(() => {
          params.lineWidth = 2;
          params.glowSize = 12;
          params.glowOpacity = 0.8;
          params.maxAmplitude = 30;
          params.particleSize = 1;
          initPoints();
          initParticles();
        }, 5000);
      } else if (command === 'minimalist') {
        // More subtle, cleaner effect for minimalist
        params.lineWidth = 1;
        params.glowSize = 6;
        params.glowOpacity = 0.4;
        params.maxAmplitude = 15;
        params.particleSize = 0.5;
        params.numPoints = 2;
        
        // Fewer particles with more subtle colors
        particles.forEach(particle => {
          particle.opacity = 0.2 + Math.random() * 0.3;
          particle.size = params.particleSize + Math.random() * 1;
        });
        
        // Reset after a delay
        setTimeout(() => {
          params.lineWidth = 2;
          params.glowSize = 12;
          params.glowOpacity = 0.8;
          params.maxAmplitude = 30;
          params.particleSize = 1;
          params.numPoints = 3;
          initPoints();
          initParticles();
        }, 5000);
      } else if (command === 'futuristic' || command === 'neon') {
        // Bright, vibrant effect for futuristic/neon
        params.lineWidth = 3;
        params.glowSize = 30;
        params.glowOpacity = 1;
        params.particleSize = 3;
        params.maxAmplitude = 35;
        
        // Brighter particles with neon colors
        particles.forEach(particle => {
          particle.color = ['#ff00ff', '#00ffff', '#ffff00'][Math.floor(Math.random() * 3)];
          particle.opacity = 0.8 + Math.random() * 0.2;
          particle.size = params.particleSize + Math.random() * 4;
          particle.speed = 1 + Math.random() * 2;
        });
        
        // Reset after a delay
        setTimeout(() => {
          params.lineWidth = 2;
          params.glowSize = 12;
          params.glowOpacity = 0.8;
          params.particleSize = 1;
          params.maxAmplitude = 30;
          initPoints();
          initParticles();
        }, 5000);
      } else if (command === 'geometric' || command === 'pattern') {
        // More structured, patterned effect
        params.numPoints = 5;
        params.curveSegments = 50;
        params.lineWidth = 2.5;
        params.maxAmplitude = 25;
        
        // More structured particle arrangement
        particles.forEach((particle, i) => {
          particle.angle = (i / numParticles) * Math.PI * 2;
          particle.speed = 0.3 + Math.random() * 0.5;
          particle.size = 1 + (i % 3);
        });
        
        // Reset after a delay
        setTimeout(() => {
          params.numPoints = 3;
          params.curveSegments = 100;
          params.lineWidth = 2;
          params.maxAmplitude = 30;
          initPoints();
          initParticles();
        }, 5000);
      }
    };
    
    // Return functions to control the animation
    return {
      stop: () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      },
      modifyAnimation
    };
  };

  // Initialize the animation for the input container
  const inputContainer = document.querySelector('.input-container');
  if (inputContainer) {
    const animationContainer = setupAnimationContainer(inputContainer);
    const { ctx, canvas } = initCanvas(animationContainer);
    const animationController = createFlowingLineAnimation(ctx, canvas);
    
    // Expose the animation controller globally
    window.animationController = animationController;
  }
};

// Initialize the animation when the DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initInputAnimation === 'function') {
      window.initInputAnimation();
    }
  });
} else {
  // DOM already loaded, initialize immediately
  if (typeof window.initInputAnimation === 'function') {
    window.initInputAnimation();
  }
}

// Export the initialization function
window.initInputAnimation = initInputAnimation; 