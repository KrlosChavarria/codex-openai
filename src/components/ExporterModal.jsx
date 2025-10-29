import { useMemo } from 'react';
import PropTypes from 'prop-types';
import './ExporterModal.css';

const generateEmbedCode = (theme, states) =>
  [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '    <title>USA Globe Widget</title>',
    '    <style>',
    `      body { margin: 0; font-family: 'Inter', sans-serif; background: radial-gradient(circle at 20% 20%, ${theme.backgroundA} 0%, ${theme.backgroundB} 100%); color: #f8fafc; }`,
    '      #widget { width: 100vw; height: 100vh; }',
    '      .tooltip { position: absolute; background: rgba(15, 23, 42, 0.92); border-radius: 10px; padding: 8px 12px; font-size: 13px; pointer-events: none; color: #f8fafc; border: 1px solid rgba(148, 163, 184, 0.3); transform: translate(-50%, -120%); }',
    '    </style>',
    '  </head>',
    '  <body>',
    '    <div id="widget"></div>',
    '    <div id="tooltip" class="tooltip" style="opacity:0"></div>',
    '    <script type="module">',
    "      import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';",
    "      import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';",
    `      const states = ${JSON.stringify(states)};`,
    "      const container = document.getElementById('widget');",
    "      const tooltip = document.getElementById('tooltip');",
    '      const scene = new THREE.Scene();',
    '      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);',
    '      camera.position.set(0, 0, 5);',
    '      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });',
    '      renderer.setSize(window.innerWidth, window.innerHeight);',
    '      container.appendChild(renderer.domElement);',
    '      const light = new THREE.DirectionalLight(0xffffff, 1.2);',
    '      light.position.set(5, 5, 5);',
    '      scene.add(light);',
    '      const ambient = new THREE.AmbientLight(0xaaaaaa, 0.6);',
    '      scene.add(ambient);',
    `      const globeGeometry = new THREE.SphereGeometry(1.6, 64, 64);`,
    `      const globeMaterial = new THREE.MeshPhongMaterial({ color: '${theme.oceanColor}', emissive: '${theme.oceanColor}', emissiveIntensity: 0.12, shininess: 22 });`,
    '      const globe = new THREE.Mesh(globeGeometry, globeMaterial);',
    '      scene.add(globe);',
    `      const pinMaterial = new THREE.MeshStandardMaterial({ color: '${theme.pinColor}', emissive: '${theme.pinColor}', emissiveIntensity: 0.4 });`,
    '      const pins = [];',
    '      const createPin = (state) => {',
    '        const group = new THREE.Group();',
    '        const coneGeometry = new THREE.ConeGeometry(0.015, 0.08, 16);',
    '        const sphereGeometry = new THREE.SphereGeometry(0.022, 16, 16);',
    '        const cone = new THREE.Mesh(coneGeometry, pinMaterial);',
    '        const ball = new THREE.Mesh(sphereGeometry, pinMaterial);',
    '        cone.position.y = -0.06;',
    '        cone.rotation.x = Math.PI;',
    '        group.add(cone);',
    '        group.add(ball);',
    '        const lat = (state.latitude * Math.PI) / 180;',
    '        const lon = (-state.longitude * Math.PI) / 180;',
    '        const radius = 1.62;',
    '        const x = radius * Math.cos(lat) * Math.cos(lon);',
    '        const y = radius * Math.sin(lat);',
    '        const z = radius * Math.cos(lat) * Math.sin(lon);',
    '        group.position.set(x, y, z);',
    '        group.lookAt(0, 0, 0);',
    '        group.userData = { state };',
    '        pins.push(group);',
    '        scene.add(group);',
    '      };',
    '      states.forEach(createPin);',
    '      const controls = new OrbitControls(camera, renderer.domElement);',
    '      controls.enablePan = false;',
    '      controls.minDistance = 2.5;',
    '      controls.maxDistance = 6;',
    '      const raycaster = new THREE.Raycaster();',
    '      const pointer = new THREE.Vector2();',
    '      let hovered = null;',
    '      function onPointerMove(event) {',
    '        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;',
    '        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;',
    '        raycaster.setFromCamera(pointer, camera);',
    '        const intersects = raycaster.intersectObjects(pins, true);',
    '        if (intersects.length) {',
    '          const { state } = intersects[0].object.parent.userData;',
    '          hovered = state;',
    '          tooltip.style.opacity = 1;',
    "          tooltip.style.left = event.clientX + 'px';",
    "          tooltip.style.top = event.clientY + 'px';",
    "          tooltip.innerHTML = '<strong>' + state.name + '</strong><div>' + state.capital + '</div>';",
    '        } else {',
    '          hovered = null;',
    '          tooltip.style.opacity = 0;',
    '        }',
    '      }',
    '      window.addEventListener(\'pointermove\', onPointerMove);',
    '      function animate() {',
    '        requestAnimationFrame(animate);',
    '        globe.rotation.y += 0.0015;',
    '        renderer.render(scene, camera);',
    '      }',
    '      animate();',
    '      window.addEventListener(\'resize\', () => {',
    '        camera.aspect = window.innerWidth / window.innerHeight;',
    '        camera.updateProjectionMatrix();',
    '        renderer.setSize(window.innerWidth, window.innerHeight);',
    '      });',
    '    </script>',
    '  </body>',
    '</html>',
  ].join('\n');

export default function ExporterModal({ onClose, theme, states }) {
  const code = useMemo(() => generateEmbedCode(theme, states), [theme, states]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="exporter">
      <div className="exporter__backdrop" onClick={onClose} />
      <div className="exporter__dialog">
        <header>
          <div>
            <h2>Embed this experience</h2>
            <p>Paste the generated code into any HTML file.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close exporter">
            ×
          </button>
        </header>
        <textarea readOnly value={code} />
        <div className="exporter__actions">
          <button type="button" onClick={handleCopy}>
            Copy code
          </button>
        </div>
      </div>
    </div>
  );
}

ExporterModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  states: PropTypes.arrayOf(PropTypes.object).isRequired,
};
