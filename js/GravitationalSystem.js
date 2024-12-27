class Body {
  constructor(mass, position, velocity, color) {
    this.mass = mass;
    this.position = position;
    this.velocity = velocity;

    // Create visual representation
    const geometry = new THREE.SphereGeometry(Math.pow(mass, 1 / 3) * 0.1);
    const material = new THREE.MeshBasicMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  update(position) {
    this.position.copy(position);
    this.mesh.position.copy(position);
  }
}

export class GravitationalSystem {
  constructor(scene) {
    this.scene = scene;
    this.bodies = [];
    this.trails = [];
    this.trailGeometries = [];
    this.trailPoints = [];
    this.init();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener("keydown", (event) => {
      if (event.key === "n") {
        this.addRandomBody();
      }
    });
  }

  generateRandomColor() {
    return Math.random() * 0xffffff;
  }

  addRandomBody() {
    // Random mass between 50 and 150
    const mass = 50 + Math.random() * 1000;

    // Random position in a sphere of radius 4
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4 * Math.cbrt(Math.random());
    const position = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // Random velocity between -1 and 1 in each dimension
    const velocity = new THREE.Vector3(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    );

    const color = this.generateRandomColor();
    const body = new Body(mass, position, velocity, color);
    this.bodies.push(body);
    this.scene.add(body.mesh);

    // Add new trail
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: color,
      opacity: 0.5,
      transparent: true,
    });
    const trail = new THREE.Line(geometry, material);

    this.trailGeometries.push(geometry);
    this.trailPoints.push([]);
    this.trails.push(trail);
    this.scene.add(trail);
  }

  init() {
    // Physics constants
    this.G = 0.5;
    this.dt = 0.016;

    // Add initial three bodies
    const initialBodies = [
      {
        mass: 100,
        position: new THREE.Vector3(2, 0, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        color: 0xff0000,
      },
      {
        mass: 100,
        position: new THREE.Vector3(0, 2, 0),
        velocity: new THREE.Vector3(0, 0, 0),
        color: 0x0000ff,
      },
      {
        mass: 100,
        position: new THREE.Vector3(0, 0, 2),
        velocity: new THREE.Vector3(0, 0, 0),
        color: 0x00ff00,
      },
    ];

    initialBodies.forEach((bodyData) => {
      const body = new Body(
        bodyData.mass,
        bodyData.position,
        bodyData.velocity,
        bodyData.color
      );
      this.bodies.push(body);
      this.scene.add(body.mesh);

      // Initialize trail for this body
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({
        color: bodyData.color,
        opacity: 0.5,
        transparent: true,
      });
      const trail = new THREE.Line(geometry, material);

      this.trailGeometries.push(geometry);
      this.trailPoints.push([]);
      this.trails.push(trail);
      this.scene.add(trail);
    });
  }

  updateTrails() {
    this.bodies.forEach((body, i) => {
      this.trailPoints[i].push(body.position.clone());

      if (this.trailPoints[i].length > 100) {
        this.trailPoints[i].shift();
      }

      this.trailGeometries[i].setFromPoints(this.trailPoints[i]);
    });
  }

  calculateGravitationalForceBetween(body1, body2) {
    const diff = body2.position.clone().sub(body1.position);
    const distance = diff.length();

    const minDistance = 0.1;
    const clampedDistance = Math.max(distance, minDistance);

    const forceMagnitude =
      (this.G * body1.mass * body2.mass) / (clampedDistance * clampedDistance);

    return diff.normalize().multiplyScalar(forceMagnitude);
  }

  updatePositions() {
    // Initialize forces array for all bodies
    const forces = this.bodies.map(() => new THREE.Vector3());

    // Calculate forces between each pair of bodies
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const force = this.calculateGravitationalForceBetween(
          this.bodies[i],
          this.bodies[j]
        );
        // Add force to body i and subtract from body j (Newton's third law)
        forces[i].add(force);
        forces[j].sub(force);
      }
    }

    // Update velocities and positions for all bodies
    this.bodies.forEach((body, i) => {
      const acc = forces[i].multiplyScalar(1 / body.mass);
      body.velocity.add(acc.multiplyScalar(this.dt));
      const newPos = body.position
        .clone()
        .add(body.velocity.clone().multiplyScalar(this.dt));
      body.update(newPos);
    });
  }

  update() {
    this.updatePositions();
    this.updateTrails();
  }
}
