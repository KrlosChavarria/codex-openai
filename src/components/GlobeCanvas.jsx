import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './GlobeCanvas.css';

const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export default function GlobeCanvas({ theme, states, selectedState, onSelectState, onHoverState }) {
  const containerRef = useRef(null);
  const globeMaterialRef = useRef(null);
  const haloMaterialRef = useRef(null);
  const pinsRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const animationRef = useRef(null);
  const rotateGlobeRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1.15);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeGeometry = new THREE.SphereGeometry(1.8, 72, 72);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: new THREE.Color(theme.landColor),
      emissive: new THREE.Color(theme.oceanColor),
      emissiveIntensity: 0.25,
      shininess: 28,
      specular: new THREE.Color('#ffffff'),
    });
    globeMaterialRef.current = globeMaterial;
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    const haloGeometry = new THREE.SphereGeometry(1.92, 64, 64);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.oceanColor),
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    haloMaterialRef.current = haloMaterial;
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    globeGroup.add(haloMesh);

    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);

    pinsRef.current = states.map((state) => {
      const pinGroup = new THREE.Group();
      pinGroup.userData.state = state;

      const coneGeometry = new THREE.ConeGeometry(0.025, 0.12, 16);
      const sphereGeometry = new THREE.SphereGeometry(0.035, 16, 16);
      const coneMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.pinColor),
        emissive: new THREE.Color(theme.pinColor),
        emissiveIntensity: 0.5,
        roughness: 0.3,
        metalness: 0.2,
      });
      const sphereMaterial = coneMaterial.clone();

      const cone = new THREE.Mesh(coneGeometry, coneMaterial);
      const ball = new THREE.Mesh(sphereGeometry, sphereMaterial);

      cone.position.y = -0.08;
      cone.rotation.x = Math.PI;
      pinGroup.add(cone);
      pinGroup.add(ball);

      const position = latLngToVector3(state.latitude, state.longitude, 1.92);
      pinGroup.position.copy(position);
      pinGroup.lookAt(new THREE.Vector3(0, 0, 0));

      pinsGroup.add(pinGroup);
      return { state, group: pinGroup, cone, ball };
    });

    const getHitTargets = () => pinsRef.current.flatMap((entry) => entry.group.children);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 7;
    controls.enableDamping = true;
    controls.rotateSpeed = 0.4;
    controls.addEventListener('start', () => {
      rotateGlobeRef.current = false;
    });
    controls.addEventListener('end', () => {
      rotateGlobeRef.current = true;
    });

    const onResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', onResize);

    const handlePointerMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.set(x, y);
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersections = raycasterRef.current.intersectObjects(getHitTargets());

      if (intersections.length) {
        const pin = intersections[0].object.parent;
        const { state } = pin.userData;
        onHoverState({
          ...state,
          position: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
        });
      } else {
        onHoverState(null);
      }
    };

    const handlePointerLeave = () => {
      onHoverState(null);
    };

    const handlePointerDown = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.set(x, y);
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersections = raycasterRef.current.intersectObjects(getHitTargets());
      if (intersections.length) {
        const pin = intersections[0].object.parent;
        onSelectState(pin.userData.state);
      }
    };

    const handleTouchStart = (event) => {
      if (!event.touches.length) return;
      const touch = event.touches[0];
      const rect = container.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.set(x, y);
      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersections = raycasterRef.current.intersectObjects(getHitTargets());
      if (intersections.length) {
        const pin = intersections[0].object.parent;
        onSelectState(pin.userData.state);
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('touchstart', handleTouchStart);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (rotateGlobeRef.current && globeGroup) {
        globeGroup.rotation.y += 0.002;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationRef.current);
      controls.dispose();
      renderer.dispose();
      pinsRef.current.forEach(({ cone, ball }) => {
        cone.geometry.dispose();
        cone.material.dispose();
        ball.geometry.dispose();
        ball.material.dispose();
      });
      globeGeometry.dispose();
      globeMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      container.removeChild(renderer.domElement);
      pinsRef.current = [];
      onHoverState(null);
    };
  }, [states, onHoverState, onSelectState]);

  useEffect(() => {
    if (!pinsRef.current.length) return;
    pinsRef.current.forEach(({ state, cone, ball, group }) => {
      const isSelected = state.abbreviation === selectedState.abbreviation;
      const color = new THREE.Color(isSelected ? theme.highlightColor : theme.pinColor);
      cone.material.color.copy(color);
      ball.material.color.copy(color);
      cone.material.emissive.copy(color);
      ball.material.emissive.copy(color);
      group.scale.setScalar(isSelected ? 1.4 : 1);
    });
  }, [selectedState, theme.pinColor, theme.highlightColor]);

  useEffect(() => {
    if (globeMaterialRef.current) {
      globeMaterialRef.current.color.set(theme.landColor);
      globeMaterialRef.current.emissive.set(theme.oceanColor);
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.color.set(theme.oceanColor);
    }
    pinsRef.current.forEach(({ state, cone, ball }) => {
      const isSelected = state.abbreviation === selectedState.abbreviation;
      const base = isSelected ? theme.highlightColor : theme.pinColor;
      const color = new THREE.Color(base);
      cone.material.color.copy(color);
      cone.material.emissive.copy(color);
      ball.material.color.copy(color);
      ball.material.emissive.copy(color);
    });
  }, [theme, selectedState]);

  return <div className="globe" ref={containerRef} />;
}

GlobeCanvas.propTypes = {
  theme: PropTypes.object.isRequired,
  states: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedState: PropTypes.object.isRequired,
  onSelectState: PropTypes.func.isRequired,
  onHoverState: PropTypes.func.isRequired,
};
