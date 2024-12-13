'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';

export default function Canvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    // THREE.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    
    // Ensure the renderer's canvas is attached to the DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    // Cannon.js setup
    const world = new CANNON.World();
    world.gravity.set(0, 0, 0); // No gravity for floating

    // Airship physics body
    const airshipBody = new CANNON.Body({
      mass: 5,
      shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    });
    airshipBody.position.set(0, 0, 5);
    world.addBody(airshipBody);

    // Airship graphics (simple box for now)
    const airshipGeometry = new THREE.BoxGeometry(2, 2, 2);
    const airshipMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const airshipMesh = new THREE.Mesh(airshipGeometry, airshipMaterial);
    scene.add(airshipMesh);

    // Camera setup
    camera.position.z = 10; // Start with camera at a distance of 10 along the Z-axis

    // Update physics and synchronize Three.js mesh
    const updatePhysics = () => {
      world.step(1 / 60);
      airshipMesh.position.copy(airshipBody.position);
      airshipMesh.quaternion.copy(airshipBody.quaternion);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      updatePhysics();

      // Make camera follow the airship
      camera.position.x = airshipBody.position.x;
      camera.position.y = airshipBody.position.y;
      camera.position.z = airshipBody.position.z + 10; // Adjust offset for better view
      camera.lookAt(airshipBody.position); // Camera looks at the airship

      renderer.render(scene, camera); // Render the scene
    };

    animate();

    // Handle player controls
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowUp': // Move forward
          airshipBody.applyForce(new CANNON.Vec3(0, 100, 0), airshipBody.position);
          break;
        case 'ArrowDown': // Move backward
          airshipBody.applyForce(new CANNON.Vec3(0, -100, 0), airshipBody.position);
          break;
        case 'ArrowLeft': // Rotate left
          airshipBody.torque.set(0, 0, 50);
          break;
        case 'ArrowRight': // Rotate right
          airshipBody.torque.set(0, 0, -50);
          break;
      }

      // Reset torque after applying it
      setTimeout(() => airshipBody.torque.set(0, 0, 0), 100);
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
}
