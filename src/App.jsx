import { useState } from 'react';
import GlobeCanvas from './components/GlobeCanvas.jsx';
import Sidebar from './components/Sidebar.jsx';
import ExporterModal from './components/ExporterModal.jsx';
import statesData from './data/states.js';
import './styles/app.css';

const defaultTheme = {
  backgroundA: '#0f172a',
  backgroundB: '#020617',
  oceanColor: '#0ea5e9',
  landColor: '#38bdf8',
  pinColor: '#f472b6',
  highlightColor: '#facc15',
};

export default function App() {
  const [selectedState, setSelectedState] = useState(statesData[0]);
  const [hoveredState, setHoveredState] = useState(null);
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  const handleThemeChange = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const tooltipState = hoveredState || selectedState;

  return (
    <div
      className="app"
      style={{
        background: `radial-gradient(circle at 20% 20%, ${theme.backgroundA} 0%, ${theme.backgroundB} 100%)`,
      }}
    >
      <div className="app__layout">
        <div className="app__globe">
          <GlobeCanvas
            theme={theme}
            states={statesData}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            onHoverState={setHoveredState}
          />
          {tooltipState && hoveredState && (
            <div
              className="app__tooltip"
              style={{ left: hoveredState.position.x, top: hoveredState.position.y }}
            >
              <p className="app__tooltip-title">{tooltipState.name}</p>
              <p className="app__tooltip-meta">{tooltipState.capital}</p>
            </div>
          )}
        </div>
        <Sidebar
          selectedState={selectedState}
          onSelectState={setSelectedState}
          states={statesData}
          theme={theme}
          onChangeTheme={handleThemeChange}
          onOpenExporter={() => setIsExporterOpen(true)}
        />
      </div>
      {isExporterOpen && (
        <ExporterModal
          onClose={() => setIsExporterOpen(false)}
          theme={theme}
          states={statesData}
        />
      )}
    </div>
  );
}
