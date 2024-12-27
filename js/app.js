import { GravitationalSystem } from "./GravitationalSystem.js";

class App {
  constructor() {
    this.init();
    this.animate();
  }

  init() {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 15;

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Create gravitational system
    this.gravSystem = new GravitationalSystem(this.scene);

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update gravitational system
    this.gravSystem.update();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
