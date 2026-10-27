import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeTitleBackdrop: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070d, 0.038);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x05070d, 1);
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 4.5, 18);
    cyanLight.position.set(-3, 2, 2);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xf43f5e, 4.5, 18);
    magentaLight.position.set(3, 2, 2);
    scene.add(magentaLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 2.5, 15);
    amberLight.position.set(0, -1, 3);
    scene.add(amberLight);

    // 3. Central Holographic Core (Icosahedron & Crystal Wireframe)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const crystalGeom = new THREE.IcosahedronGeometry(1.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x082f49,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    });
    const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
    coreGroup.add(crystalMesh);

    const wireframeGeom = new THREE.IcosahedronGeometry(1.35, 0);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeom, wireframeMat);
    coreGroup.add(wireframeMesh);

    // 4. Orbital Energy Rings
    const ring1Geom = new THREE.TorusGeometry(2.1, 0.035, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(2.35, 0.025, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.65 });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 5. Hexagonal Combat Arena Platform Floor
    const hexGeom = new THREE.CylinderGeometry(4.2, 4.4, 0.2, 6);
    const hexMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      metalness: 0.9,
      roughness: 0.3,
    });
    const hexPlatform = new THREE.Mesh(hexGeom, hexMat);
    hexPlatform.position.y = -2.2;
    scene.add(hexPlatform);

    // Glowing rim for hex platform
    const hexWire = new THREE.EdgesGeometry(hexGeom);
    const hexWireMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const hexWireMesh = new THREE.LineSegments(hexWire, hexWireMat);
    hexPlatform.add(hexWireMesh);

    // Sub-stage grid ring
    const gridHelper = new THREE.PolarGridHelper(8, 8, 8, 32, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2.25;
    scene.add(gridHelper);

    // 6. Particle Constellation
    const particleCount = 450;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0xf43f5e);
    const color3 = new THREE.Color(0xfbbf24);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 6.5;
      const angle = Math.random() * Math.PI * 2;
      const y = -2.0 + Math.random() * 5.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const pick = Math.random();
      const col = pick < 0.5 ? color1 : pick < 0.85 ? color2 : color3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 7. Mouse tracker
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Parallax camera movement
      camera.position.x = mouseRef.current.x * 1.2;
      camera.position.y = 1.8 + mouseRef.current.y * 0.7;
      camera.lookAt(0, 0.2, 0);

      // Core rotation & hover
      coreGroup.rotation.y = elapsedTime * 0.4;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
      coreGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.15;

      // Inner wireframe counter-spin
      wireframeMesh.rotation.y = -elapsedTime * 0.6;
      wireframeMesh.rotation.z = elapsedTime * 0.3;

      // Energy rings spin
      ring1.rotation.z = elapsedTime * 0.8;
      ring2.rotation.z = -elapsedTime * 0.9;
      ring2.rotation.x = Math.PI / 4 + Math.sin(elapsedTime * 0.5) * 0.2;

      // Orbiting dynamic point lights
      cyanLight.position.x = Math.cos(elapsedTime * 0.9) * 3.8;
      cyanLight.position.z = Math.sin(elapsedTime * 0.9) * 3.8;
      cyanLight.position.y = Math.sin(elapsedTime * 1.5) * 1.2 + 0.8;

      magentaLight.position.x = Math.cos(elapsedTime * 0.9 + Math.PI) * 3.8;
      magentaLight.position.z = Math.sin(elapsedTime * 0.9 + Math.PI) * 3.8;
      magentaLight.position.y = Math.cos(elapsedTime * 1.5) * 1.2 + 0.8;

      // Particle subtle rotation
      particles.rotation.y = elapsedTime * 0.06;

      // Hex floor subtle rotation
      hexPlatform.rotation.y = -elapsedTime * 0.03;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // 10. Clean up
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      crystalGeom.dispose();
      crystalMat.dispose();
      wireframeGeom.dispose();
      wireframeMat.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      hexGeom.dispose();
      hexMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.92 }}
    />
  );
};
