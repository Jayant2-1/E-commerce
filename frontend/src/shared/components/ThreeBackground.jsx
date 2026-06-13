import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground({ color = '#0a1628' }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(color);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Particle System ──
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    for (let i = 0; i < particleCount; i++) {
      sizes[i] = Math.random() * 2 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ── Floating Geometric Forms ──
    const forms = [];
    const formColors = [0xc49b5e, 0x4a6fa5, 0x6b4a7a, 0x3a7a5a];
    const formGeometries = [
      new THREE.IcosahedronGeometry(0.8, 0),
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.TorusGeometry(0.6, 0.2, 12, 18),
      new THREE.TetrahedronGeometry(0.9, 0),
    ];

    for (let i = 0; i < 12; i++) {
      const geo = formGeometries[i % formGeometries.length];
      const mat = new THREE.MeshPhysicalMaterial({
        color: formColors[i % formColors.length],
        transparent: true,
        opacity: 0.15 + Math.random() * 0.15,
        wireframe: false,
        metalness: 0.3,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15 - 5
      );
      const scale = 0.5 + Math.random() * 2;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      forms.push({
        mesh,
        rotSpeed: { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005 },
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatAmp: 0.3 + Math.random() * 0.5,
        initialY: mesh.position.y,
      });
    }

    // ── Wireframe Grid ──
    const gridHelper = new THREE.GridHelper(40, 40, 0xffffff, 0xffffff);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.03;
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // Mouse move
    const onMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse);

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      const t = clock.getElapsedTime();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Camera follows mouse slightly
      camera.position.x += (mx * 1.5 - camera.position.x) * 0.02;
      camera.position.y += (-my * 1.5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      // Rotate forms
      forms.forEach((f, i) => {
        f.mesh.rotation.x += f.rotSpeed.x;
        f.mesh.rotation.y += f.rotSpeed.y;
        f.mesh.position.y = f.initialY + Math.sin(t * f.floatSpeed + i) * f.floatAmp;
      });

      // Slowly rotate entire particle field
      particles.rotation.y = t * 0.02;
      particles.rotation.x = Math.sin(t * 0.01) * 0.05;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}