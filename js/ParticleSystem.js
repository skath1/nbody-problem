export class ParticleSystem {
  constructor(scene, particleCount = 1000) {
    this.scene = scene;
    this.particleCount = particleCount;
    this.mesh = this.createParticleMesh();
    this.scene.add(this.mesh);
  }

  createParticleMesh() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount * 3; i++) {
      positions[i] = Math.random() - 0.5;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });

    return new THREE.Points(geometry, material);
  }

  update(mouseX, mouseY) {
    if (!this.mesh) return;

    // Base rotation
    this.mesh.rotation.y += 0.001;
    this.mesh.rotation.x += 0.001;

    // Mouse-based rotation
    this.mesh.rotation.x += mouseY * 0.1;
    this.mesh.rotation.y += mouseX * 0.1;
  }
}
