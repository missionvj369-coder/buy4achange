import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MISSION_3D_THEMES, MissionTheme3D } from '../data/mission3dThemes.ts';

interface StudioStage3DProps {
  activeMissionIndex: number;
}

export const StudioStage3D: React.FC<StudioStage3DProps> = ({ activeMissionIndex }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetThemeRef = useRef<MissionTheme3D>(MISSION_3D_THEMES[activeMissionIndex % 8]);
  const activeIdxRef = useRef<number>(activeMissionIndex % 8);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const idx = ((activeMissionIndex % 8) + 8) % 8;
    targetThemeRef.current = MISSION_3D_THEMES[idx];
    activeIdxRef.current = idx;
  }, [activeMissionIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 680;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 7.6);

    // 3-Point Dramatic Studio Rim Lighting (Hape Cinema Style)
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLightA = new THREE.PointLight(new THREE.Color(targetThemeRef.current.primaryHex), 28, 18, 1.5);
    rimLightA.position.set(-4.2, 2.4, 2.8);
    scene.add(rimLightA);

    const rimLightB = new THREE.PointLight(new THREE.Color(targetThemeRef.current.accentHex), 24, 18, 1.5);
    rimLightB.position.set(4.5, -1.8, 3.2);
    scene.add(rimLightB);

    const backLight = new THREE.PointLight(new THREE.Color(targetThemeRef.current.primaryHex), 20, 20, 1.4);
    backLight.position.set(0, 0.5, -4.5);
    scene.add(backLight);

    // Master Sculptural Group
    const rig = new THREE.Group();
    scene.add(rig);

    // 1. Central High-Gloss Matte-Obsidian Sculpted Faceted Totem Core
    const coreGeo = new THREE.IcosahedronGeometry(1.38, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0B1015'),
      metalness: 0.92,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      flatShading: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rig.add(coreMesh);

    // 2. Luminous Wireframe Architectural Cage wrapping the Core
    const cageGeo = new THREE.IcosahedronGeometry(1.52, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(targetThemeRef.current.accentHex),
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    rig.add(cageMesh);

    // 3. Inner Glowing Energy Heart (Visible between facets & rings)
    const heartGeo = new THREE.OctahedronGeometry(0.75, 0);
    const heartMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(targetThemeRef.current.primaryHex),
      emissive: new THREE.Color(targetThemeRef.current.primaryHex),
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.5,
    });
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    rig.add(heartMesh);

    // 4. Three Precision Gyroscopic Chrome & Obsidian Orbital Rings
    const ringMatA = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#141B22'),
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1.0,
    });
    const ringMatB = new THREE.MeshStandardMaterial({
      color: new THREE.Color(targetThemeRef.current.primaryHex),
      emissive: new THREE.Color(targetThemeRef.current.primaryHex),
      emissiveIntensity: 0.85,
      metalness: 0.85,
      roughness: 0.18,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.048, 24, 120), ringMatA);
    ring1.rotation.set(Math.PI * 0.36, 0.2, 0);
    rig.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.58, 0.022, 16, 120), ringMatB);
    ring2.rotation.set(-Math.PI * 0.28, 0.55, 0.3);
    rig.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.014, 16, 120), ringMatA);
    ring3.rotation.set(Math.PI * 0.48, -0.4, 0.2);
    rig.add(ring3);

    // 5. Eight Orbiting 3D Mission Node Spheres (01..08)
    const nodesGroup = new THREE.Group();
    rig.add(nodesGroup);
    const nodeMeshes: THREE.Mesh[] = [];
    const nodeOrbitRadius = 2.58;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const theme = MISSION_3D_THEMES[i];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.primaryHex),
        emissive: new THREE.Color(theme.primaryHex),
        emissiveIntensity: i === activeIdxRef.current ? 2.4 : 0.45,
        metalness: 0.7,
        roughness: 0.2,
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), mat);
      sphere.position.set(
        Math.cos(angle) * nodeOrbitRadius,
        Math.sin(angle * 2) * 0.42,
        Math.sin(angle) * nodeOrbitRadius
      );
      nodesGroup.add(sphere);
      nodeMeshes.push(sphere);
    }

    // 6. Hape-Style Floating Diagonal White-Hot Neon Studio Light Bars
    const barGeo = new THREE.CylinderGeometry(0.024, 0.024, 6.4, 12);
    const barMatWhite = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const barMatTint = new THREE.MeshBasicMaterial({
      color: new THREE.Color(targetThemeRef.current.accentHex),
      transparent: true,
      opacity: 0.65,
    });

    const barLeft = new THREE.Mesh(barGeo, barMatWhite);
    barLeft.position.set(-3.3, 0.3, -2.2);
    barLeft.rotation.z = -0.34;
    scene.add(barLeft);

    const barRight = new THREE.Mesh(barGeo, barMatTint);
    barRight.position.set(3.45, -0.25, -2.5);
    barRight.rotation.z = 0.28;
    scene.add(barRight);

    // 7. Subtle Reflective Studio Floor Disc beneath Sculpture
    const floorGeo = new THREE.CircleGeometry(5.5, 64);
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#05080B'),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.8,
      transparent: true,
      opacity: 0.55,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.45;
    scene.add(floor);

    // 8. Volumetric Drifting Studio Bokeh Particles
    const particleCount = 220;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Interactive Pointer & Scroll State
    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let scrollFactor = 0;

    const onPointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      scrollFactor = Math.min(1, window.scrollY / 900);
    };
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 680;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const targetPrimary = new THREE.Color(targetThemeRef.current.primaryHex);
    const targetAccent = new THREE.Color(targetThemeRef.current.accentHex);
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth color morphing when user presses [SPACE] or switches mission node
      targetPrimary.set(targetThemeRef.current.primaryHex);
      targetAccent.set(targetThemeRef.current.accentHex);
      rimLightA.color.lerp(targetPrimary, 0.06);
      rimLightB.color.lerp(targetAccent, 0.06);
      backLight.color.lerp(targetPrimary, 0.06);
      cageMat.color.lerp(targetAccent, 0.06);
      heartMat.color.lerp(targetPrimary, 0.06);
      heartMat.emissive.lerp(targetPrimary, 0.06);
      ringMatB.color.lerp(targetPrimary, 0.06);
      ringMatB.emissive.lerp(targetPrimary, 0.06);
      barMatTint.color.lerp(targetAccent, 0.06);

      // Smooth pointer parallax & scroll-choreographed camera orbit
      smoothX += (pointerX - smoothX) * 0.05;
      smoothY += (pointerY - smoothY) * 0.05;

      const speed = prefersReduced ? 0.08 : 1;
      coreMesh.rotation.y = t * 0.24 * speed + smoothX * 0.55 + scrollFactor * 1.4;
      coreMesh.rotation.x = Math.sin(t * 0.35 * speed) * 0.18 + smoothY * 0.35;
      cageMesh.rotation.y = -t * 0.16 * speed + smoothX * 0.4;
      cageMesh.rotation.z = t * 0.11 * speed;
      heartMesh.rotation.y = -t * 0.65 * speed;
      heartMesh.rotation.x = t * 0.45 * speed;

      ring1.rotation.z = t * 0.22 * speed;
      ring1.rotation.x = Math.PI * 0.36 + smoothY * 0.22;
      ring2.rotation.z = -t * 0.3 * speed;
      ring2.rotation.y = 0.55 + smoothX * 0.3;
      ring3.rotation.z = t * 0.15 * speed;

      // Rotate orbiting mission nodes + highlight selected mission sphere
      nodesGroup.rotation.y = t * 0.18 * speed + activeIdxRef.current * 0.785;
      nodeMeshes.forEach((mesh, idx) => {
        const isActive = idx === activeIdxRef.current;
        const targetScale = isActive ? 1.75 : 0.9;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
        const m = mesh.material as THREE.MeshStandardMaterial;
        m.emissiveIntensity += ((isActive ? 2.8 : 0.45) - m.emissiveIntensity) * 0.08;
      });

      // Floating studio light bars drift subtly
      barLeft.position.y = 0.3 + Math.sin(t * 0.6 * speed) * 0.22;
      barRight.position.y = -0.25 + Math.cos(t * 0.55 * speed) * 0.22;

      // Ambient bokeh dust motion
      particles.rotation.y = t * 0.03 * speed + smoothX * 0.08;
      particles.rotation.x = smoothY * 0.05;

      // Scroll-driven camera choreography
      camera.position.x = smoothX * 0.55;
      camera.position.y = 0.25 - smoothY * 0.35 - scrollFactor * 0.4;
      camera.position.z = 7.6 - scrollFactor * 1.1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      heartGeo.dispose();
      heartMat.dispose();
      ringMatA.dispose();
      ringMatB.dispose();
      barGeo.dispose();
      barMatWhite.dispose();
      barMatTint.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div
          className="w-72 h-72 rounded-full blur-3xl opacity-50 transition-colors duration-700"
          style={{ background: targetThemeRef.current.studioGlow }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
export default StudioStage3D;
