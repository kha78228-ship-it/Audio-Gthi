import * as THREE from 'three';

export type GravityPreset = 'earth' | 'moon' | 'zero_g' | 'jupiter' | 'vortex';

export type PhysicalObjectType = 'crystal_sphere' | 'star_gem' | 'gravity_cube' | 'quantum_cube' | 'heart_gem' | 'celestial_snack';

export interface PhysicalObjectData {
  id: string;
  type: PhysicalObjectType;
  name: string;
  emoji: string;
  mesh: THREE.Object3D;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  mass: number;
  radius: number;
  restitution: number;
  friction: number;
  isGrabbed: boolean;
  color: number;
}

export interface MascotPhysicsBody {
  mesh: THREE.Group | null;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  acc: THREE.Vector3;
  angVel: THREE.Vector3;
  mass: number;
  radius: number;
  restitution: number;
  friction: number;
  isGrabbed: boolean;
  isPhysicsActive: boolean; // false = gentle hover mode; true = full gravity & bouncy physics
  squash: THREE.Vector3;
}

export class SpatialPhysicsEngine {
  public gravityPreset: GravityPreset = 'earth';
  // Calibrated strictly to 3D PerspectiveCamera frustum (safe visible canvas area)
  public bounds = {
    floorY: -0.95,
    ceilingY: 1.15,
    wallX: 1.15,
    nearZ: 0.9,
    farZ: -0.9
  };
  
  public mascot: MascotPhysicsBody = {
    mesh: null,
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(0, 0, 0),
    acc: new THREE.Vector3(0, 0, 0),
    angVel: new THREE.Vector3(0, 0, 0),
    mass: 3.0,
    radius: 0.65,
    restitution: 0.68,
    friction: 0.96,
    isGrabbed: false,
    isPhysicsActive: false, // Default to gentle hover mode so it never drops out of sight
    squash: new THREE.Vector3(1, 1, 1)
  };

  public objects: PhysicalObjectData[] = [];
  public onCollisionCallback?: (type: string, intensity: number) => void;

  public resetMascotToCenter() {
    this.mascot.pos.set(0, 0, 0);
    this.mascot.vel.set(0, 0, 0);
    this.mascot.acc.set(0, 0, 0);
    this.mascot.angVel.set(0, 0, 0);
    this.mascot.isGrabbed = false;
    this.mascot.isPhysicsActive = false;
    this.mascot.squash.set(1, 1, 1);
    if (this.mascot.mesh) {
      this.mascot.mesh.position.set(0, 0, 0);
      this.mascot.mesh.rotation.set(0, 0, 0);
    }
  }

  public getGravityVector(pos?: THREE.Vector3): THREE.Vector3 {
    switch (this.gravityPreset) {
      case 'earth':
        return new THREE.Vector3(0, -9.8, 0);
      case 'moon':
        return new THREE.Vector3(0, -1.8, 0);
      case 'zero_g':
        return new THREE.Vector3(0, 0, 0);
      case 'jupiter':
        return new THREE.Vector3(0, -24.8, 0);
      case 'vortex':
        if (!pos) return new THREE.Vector3(0, 0, 0);
        // Pull towards mascot position or center (0, 0, 0)
        const target = this.mascot.pos;
        const dir = new THREE.Vector3().subVectors(target, pos);
        const dist = Math.max(0.4, dir.length());
        return dir.normalize().multiplyScalar(Math.min(18.0, 15.0 / (dist * dist + 0.3)));
      default:
        return new THREE.Vector3(0, -9.8, 0);
    }
  }

  // Update physics step (60 FPS dt ~ 0.016s)
  public update(dt: number = 0.016) {
    const clampedDt = Math.min(0.033, dt);

    // 1. Update Mascot Physics
    if (this.mascot.mesh) {
      // Harmonic spring squash & stretch recovery
      this.mascot.squash.x += (1.0 - this.mascot.squash.x) * 0.18;
      this.mascot.squash.y += (1.0 - this.mascot.squash.y) * 0.18;
      this.mascot.squash.z += (1.0 - this.mascot.squash.z) * 0.18;

      if (!this.mascot.isGrabbed && this.mascot.isPhysicsActive) {
        const g = this.getGravityVector(this.mascot.pos);
        this.mascot.vel.addScaledVector(g, clampedDt);
        this.mascot.vel.multiplyScalar(0.99); // air drag
        this.mascot.pos.addScaledVector(this.mascot.vel, clampedDt);

        // Angular decay
        this.mascot.angVel.multiplyScalar(0.95);
        this.mascot.mesh.rotation.x += this.mascot.angVel.x * clampedDt;
        this.mascot.mesh.rotation.z += this.mascot.angVel.z * clampedDt;

        // Mascot Floor Collision
        if (this.mascot.pos.y - this.mascot.radius < this.bounds.floorY) {
          this.mascot.pos.y = this.bounds.floorY + this.mascot.radius;
          const impact = Math.abs(this.mascot.vel.y);
          if (impact > 0.4) {
            this.mascot.squash.set(1.22, 0.72, 1.22);
            if (this.onCollisionCallback) this.onCollisionCallback('mascot_floor', impact);
          }
          this.mascot.vel.y = -this.mascot.vel.y * this.mascot.restitution;
          this.mascot.vel.x *= this.mascot.friction;
          this.mascot.vel.z *= this.mascot.friction;
        }

        // Mascot Ceiling Collision
        if (this.mascot.pos.y + this.mascot.radius > this.bounds.ceilingY) {
          this.mascot.pos.y = this.bounds.ceilingY - this.mascot.radius;
          this.mascot.vel.y = -this.mascot.vel.y * this.mascot.restitution;
        }

        // Mascot Wall Left/Right Collision
        if (this.mascot.pos.x - this.mascot.radius < -this.bounds.wallX) {
          this.mascot.pos.x = -this.bounds.wallX + this.mascot.radius;
          this.mascot.vel.x = -this.mascot.vel.x * this.mascot.restitution;
          this.mascot.angVel.z -= this.mascot.vel.y * 0.2;
        } else if (this.mascot.pos.x + this.mascot.radius > this.bounds.wallX) {
          this.mascot.pos.x = this.bounds.wallX - this.mascot.radius;
          this.mascot.vel.x = -this.mascot.vel.x * this.mascot.restitution;
          this.mascot.angVel.z += this.mascot.vel.y * 0.2;
        }

        // Depth limits
        if (this.mascot.pos.z < this.bounds.farZ) {
          this.mascot.pos.z = this.bounds.farZ;
          this.mascot.vel.z = -this.mascot.vel.z * this.mascot.restitution;
        } else if (this.mascot.pos.z > this.bounds.nearZ) {
          this.mascot.pos.z = this.bounds.nearZ;
          this.mascot.vel.z = -this.mascot.vel.z * this.mascot.restitution;
        }

        // Hard clamping to guarantee mascot never leaves visible camera area
        this.mascot.pos.x = THREE.MathUtils.clamp(this.mascot.pos.x, -this.bounds.wallX + 0.1, this.bounds.wallX - 0.1);
        this.mascot.pos.y = THREE.MathUtils.clamp(this.mascot.pos.y, this.bounds.floorY + 0.1, this.bounds.ceilingY - 0.1);
        this.mascot.pos.z = THREE.MathUtils.clamp(this.mascot.pos.z, this.bounds.farZ, this.bounds.nearZ);

        this.mascot.mesh.position.copy(this.mascot.pos);
      }
    }

    // 2. Update Physical Objects
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.isGrabbed) continue;

      const g = this.getGravityVector(obj.pos);
      obj.vel.addScaledVector(g, clampedDt);
      obj.vel.multiplyScalar(0.992); // air resistance
      obj.pos.addScaledVector(obj.vel, clampedDt);

      // Spin rotation
      obj.mesh.rotation.x += obj.angVel.x * clampedDt;
      obj.mesh.rotation.y += obj.angVel.y * clampedDt;
      obj.mesh.rotation.z += obj.angVel.z * clampedDt;
      obj.angVel.multiplyScalar(0.985);

      // Floor
      if (obj.pos.y - obj.radius < this.bounds.floorY) {
        obj.pos.y = this.bounds.floorY + obj.radius;
        const impact = Math.abs(obj.vel.y);
        if (impact > 0.4 && this.onCollisionCallback) {
          this.onCollisionCallback(obj.type, impact);
        }
        obj.vel.y = -obj.vel.y * obj.restitution;
        obj.vel.x *= obj.friction;
        obj.vel.z *= obj.friction;
        obj.angVel.z -= obj.vel.x * 2.5;
      }

      // Ceiling
      if (obj.pos.y + obj.radius > this.bounds.ceilingY) {
        obj.pos.y = this.bounds.ceilingY - obj.radius;
        obj.vel.y = -obj.vel.y * obj.restitution;
      }

      // Walls
      if (obj.pos.x - obj.radius < -this.bounds.wallX) {
        obj.pos.x = -this.bounds.wallX + obj.radius;
        obj.vel.x = -obj.vel.x * obj.restitution;
      } else if (obj.pos.x + obj.radius > this.bounds.wallX) {
        obj.pos.x = this.bounds.wallX - obj.radius;
        obj.vel.x = -obj.vel.x * obj.restitution;
      }

      // Z Depth
      if (obj.pos.z < this.bounds.farZ) {
        obj.pos.z = this.bounds.farZ;
        obj.vel.z = -obj.vel.z * obj.restitution;
      } else if (obj.pos.z > this.bounds.nearZ) {
        obj.pos.z = this.bounds.nearZ;
        obj.vel.z = -obj.vel.z * obj.restitution;
      }

      obj.mesh.position.copy(obj.pos);

      // Object <-> Mascot Collision
      if (this.mascot.mesh) {
        const delta = new THREE.Vector3().subVectors(obj.pos, this.mascot.pos);
        const dist = delta.length();
        const minDist = this.mascot.radius + obj.radius;

        if (dist < minDist && dist > 0.001) {
          const normal = delta.clone().normalize();
          const overlap = minDist - dist;
          obj.pos.addScaledVector(normal, overlap * 0.7);
          if (this.mascot.isPhysicsActive) {
            this.mascot.pos.addScaledVector(normal, -overlap * 0.3);
          }

          const relativeVel = new THREE.Vector3().subVectors(obj.vel, this.mascot.vel);
          const velAlongNormal = relativeVel.dot(normal);

          if (velAlongNormal < 0) {
            const e = Math.min(this.mascot.restitution, obj.restitution);
            const impulse = -(1 + e) * velAlongNormal / (1 / this.mascot.mass + 1 / obj.mass);
            
            const impulseVec = normal.clone().multiplyScalar(impulse);
            obj.vel.addScaledVector(impulseVec, 1 / obj.mass);
            if (this.mascot.isPhysicsActive) {
              this.mascot.vel.addScaledVector(impulseVec, -1 / this.mascot.mass);
            }
            
            // Squash reaction on mascot
            this.mascot.squash.set(1.15, 0.85, 1.15);
            if (this.onCollisionCallback) {
              this.onCollisionCallback('mascot_hit', Math.abs(impulse));
            }
          }
        }
      }
    }

    // 3. Object <-> Object Collisions
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        const objA = this.objects[i];
        const objB = this.objects[j];

        const delta = new THREE.Vector3().subVectors(objB.pos, objA.pos);
        const dist = delta.length();
        const minDist = objA.radius + objB.radius;

        if (dist < minDist && dist > 0.001) {
          const normal = delta.clone().normalize();
          const overlap = minDist - dist;

          // Push apart
          objA.pos.addScaledVector(normal, -overlap * 0.5);
          objB.pos.addScaledVector(normal, overlap * 0.5);

          const relativeVel = new THREE.Vector3().subVectors(objB.vel, objA.vel);
          const velAlongNormal = relativeVel.dot(normal);

          if (velAlongNormal < 0) {
            const e = (objA.restitution + objB.restitution) * 0.5;
            const impulse = -(1 + e) * velAlongNormal / (1 / objA.mass + 1 / objB.mass);
            const impulseVec = normal.clone().multiplyScalar(impulse);

            objA.vel.addScaledVector(impulseVec, -1 / objA.mass);
            objB.vel.addScaledVector(impulseVec, 1 / objB.mass);

            if (this.onCollisionCallback) {
              this.onCollisionCallback('objects_clash', Math.abs(impulse));
            }
          }
        }
      }
    }
  }

  // Create 3D Meshes for Physical Objects
  public spawnPhysicalObject(
    scene: THREE.Scene,
    type: PhysicalObjectType,
    spawnPos?: THREE.Vector3,
    initialVel?: THREE.Vector3
  ): PhysicalObjectData {
    let mesh: THREE.Object3D;
    let radius = 0.28;
    let mass = 1.0;
    let restitution = 0.8;
    let friction = 0.95;
    let color = 0xf59e0b;
    let name = 'Vật Thể 3D';
    let emoji = '🔮';

    const pos = spawnPos || new THREE.Vector3(
      (Math.random() - 0.5) * 1.8,
      1.5 + Math.random() * 0.6,
      (Math.random() - 0.5) * 0.8
    );
    const vel = initialVel || new THREE.Vector3(
      (Math.random() - 0.5) * 3.0,
      1.5 + Math.random() * 2.0,
      (Math.random() - 0.5) * 2.0
    );

    if (type === 'crystal_sphere') {
      name = 'Ngọc Cầu Pha Lê';
      emoji = '🔮';
      color = 0x38bdf8;
      radius = 0.25;
      mass = 1.2;
      restitution = 0.88;
      const geo = new THREE.SphereGeometry(radius, 32, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85
      });
      mesh = new THREE.Mesh(geo, mat);
    } else if (type === 'star_gem') {
      name = 'Kẹo Sao Tinh Tú';
      emoji = '⭐';
      color = 0xfde047;
      radius = 0.28;
      mass = 0.8;
      restitution = 0.82;
      const geo = new THREE.OctahedronGeometry(radius, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      mesh = new THREE.Mesh(geo, mat);
    } else if (type === 'gravity_cube' || type === 'quantum_cube') {
      name = 'Khối Lượng Tử';
      emoji = '🧊';
      color = 0xa855f7;
      radius = 0.32;
      mass = 4.5;
      restitution = 0.55;
      const geo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.9
      });
      mesh = new THREE.Mesh(geo, mat);
    } else if (type === 'heart_gem') {
      name = 'Trái Tim Plasma';
      emoji = '💖';
      color = 0xf43f5e;
      radius = 0.26;
      mass = 0.9;
      restitution = 0.85;
      const heartGroup = new THREE.Group();
      const hMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), hMat);
      s1.position.set(-0.09, 0.08, 0);
      const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), hMat);
      s2.position.set(0.09, 0.08, 0);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 16), hMat);
      cone.rotation.z = Math.PI;
      cone.position.set(0, -0.06, 0);
      heartGroup.add(s1, s2, cone);
      mesh = heartGroup;
    } else {
      // celestial_snack
      name = 'Bánh Thần Tiên';
      emoji = '🍖';
      color = 0xfb923c;
      radius = 0.24;
      mass = 1.0;
      restitution = 0.6;
      const snackGeo = new THREE.TorusGeometry(0.16, 0.08, 16, 24);
      const snackMat = new THREE.MeshStandardMaterial({
        color: 0xfb923c,
        emissive: 0xea580c,
        emissiveIntensity: 0.3,
        roughness: 0.4
      });
      mesh = new THREE.Mesh(snackGeo, snackMat);
    }

    mesh.position.copy(pos);
    scene.add(mesh);

    const objData: PhysicalObjectData = {
      id: `phys_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      name,
      emoji,
      mesh,
      pos,
      vel,
      angVel: new THREE.Vector3(
        (Math.random() - 0.5) * 8.0,
        (Math.random() - 0.5) * 8.0,
        (Math.random() - 0.5) * 8.0
      ),
      mass,
      radius,
      restitution,
      friction,
      isGrabbed: false,
      color
    };

    this.objects.push(objData);
    return objData;
  }

  // Clear all spawned objects
  public clearObjects(scene: THREE.Scene) {
    this.objects.forEach(obj => {
      scene.remove(obj.mesh);
    });
    this.objects = [];
  }

  // Launch Super Toss
  public superTossMascot(angleDeg: number = 55, power: number = 9.0) {
    if (!this.mascot.mesh) return;
    const rad = (angleDeg * Math.PI) / 180;
    this.mascot.vel.set(
      Math.cos(rad) * power * (Math.random() > 0.5 ? 1 : -1),
      Math.sin(rad) * power,
      (Math.random() - 0.5) * 2.0
    );
    this.mascot.angVel.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    );
  }

  // Toss Mascot with specific velocity
  public tossMascot(vx: number = 0, vy: number = 8.0, vz: number = 0) {
    if (!this.mascot.mesh) return;
    this.mascot.vel.set(vx, vy, vz);
    this.mascot.angVel.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    );
  }
}

export const spatialPhysics = new SpatialPhysicsEngine();
