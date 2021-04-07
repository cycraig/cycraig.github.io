import init, { BoidFlock } from './pkg/boids.js';

const canvas = document.querySelector('canvas');
resize()
window.addEventListener('resize', resize);

const main = async () => {
  try {
    let wasm = await init();
    const memory = wasm.memory;
    
    const ctx = canvas.getContext('2d', { antialias: false });
    const flock = new BoidFlock(50);
    const count = flock.count();
    
    const positions = new Float32Array(memory.buffer, flock.positions(), 2*count);
    const velocities = new Float32Array(memory.buffer, flock.velocities(), 2*count);
    for(let i=0; i<count*2; i+=2) {
      positions[i] = Math.random()*canvas.width;
      positions[i+1] = Math.random()*canvas.height;
      velocities[i] = 2*Math.random()-1;
      velocities[i+1] = 2*Math.random()-1;
    }

    canvas.addEventListener("click", event => {
      
      const boundingRect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / boundingRect.width;
      const scaleY = canvas.height / boundingRect.height;

      const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
      const canvasTop = (event.clientY - boundingRect.top) * scaleY;

      flock.set_attractor(canvasLeft, canvasTop);
    });
    canvas.addEventListener("mousemove", event => {
      const boundingRect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / boundingRect.width;
      const scaleY = canvas.height / boundingRect.height;

      const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
      const canvasTop = (event.clientY - boundingRect.top) * scaleY;

      flock.set_repulsor(canvasLeft, canvasTop);
    });

    const loop = () => {
      flock.set_width(canvas.width)
      flock.set_height(canvas.height)
      flock.update();

      // The memory locations change over time.
      const positions = new Float32Array(memory.buffer, flock.positions(), 2*count);
      const velocities = new Float32Array(memory.buffer, flock.velocities(), 2*count);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'gray';
      ctx.strokeStyle = 'gray';
      
      for (let i = 0; i < count; i += 2) {
        //ctx.fillRect(all[i], all[i + 1], 2, 2);
        const halfWidth = 2;
        const height = 8;
        //console.log(velocities[i],velocities[i+1])
        const angle = Math.atan2(velocities[i+1], velocities[i]);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        //console.log(positions[i])
        
        ctx.beginPath();
        ctx.moveTo(-sin*halfWidth + positions[i], cos*halfWidth + positions[i+1]);
        ctx.lineTo(sin*halfWidth + positions[i], -cos*halfWidth + positions[i+1]);
        ctx.lineTo(cos*height + positions[i], sin*height + positions[i+1]);
        ctx.lineTo(-sin*halfWidth + positions[i], cos*halfWidth + positions[i+1]);
        ctx.fill();
        ctx.stroke();
      }

      window.requestAnimationFrame(loop);
    };

    loop();
  } catch (error) {
    console.error("Error importing `index.js`:", error);
  }
};

let lastMouseX = 0.;
let lastMouseY = 0.;
function updateMousePosRelativeToCanvas(evt) {
    var rect = canvas.getBoundingClientRect();
    lastMouseX = evt.clientX - rect.left;
    lastMouseY = evt.clientY - rect.top;
}

function resize() {
  canvas.width = document.getElementById("inner").clientWidth;
  canvas.height = document.getElementById("inner").scrollHeight/2;
}

document.addEventListener("mousemove", updateMousePosRelativeToCanvas, false);

main();
