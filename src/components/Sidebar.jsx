import PropTypes from 'prop-types';
import './Sidebar.css';

const themeFields = [
  { key: 'backgroundA', label: 'Background Inner' },
  { key: 'backgroundB', label: 'Background Outer' },
  { key: 'oceanColor', label: 'Ocean' },
  { key: 'landColor', label: 'Land' },
  { key: 'pinColor', label: 'Pin' },
  { key: 'highlightColor', label: 'Highlight' },
];

export default function Sidebar({
  selectedState,
  onSelectState,
  states,
  theme,
  onChangeTheme,
  onOpenExporter,
}) {
  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <div>
          <h1>USA Globe Explorer</h1>
          <p>Tap a pin or choose a state to learn more.</p>
        </div>
        <button className="sidebar__export" type="button" onClick={onOpenExporter}>
          Export Widget
        </button>
      </header>
      <section className="sidebar__card">
        <h2>{selectedState.name}</h2>
        <div className="sidebar__meta">
          <div>
            <span className="sidebar__meta-label">Capital</span>
            <p>{selectedState.capital}</p>
          </div>
          <div>
            <span className="sidebar__meta-label">Nickname</span>
            <p>{selectedState.nickname}</p>
          </div>
        </div>
        <div className="sidebar__stat-grid">
          <div>
            <span className="sidebar__stat-label">Population</span>
            <p className="sidebar__stat-value">{selectedState.population}</p>
          </div>
          <div>
            <span className="sidebar__stat-label">Region</span>
            <p className="sidebar__stat-value">{selectedState.region}</p>
          </div>
        </div>
        <p className="sidebar__description">{selectedState.description}</p>
      </section>
      <section className="sidebar__card">
        <h3>Customize theme</h3>
        <div className="sidebar__theme-grid">
          {themeFields.map((field) => (
            <label key={field.key} className="sidebar__theme-field">
              <span>{field.label}</span>
              <input
                type="color"
                value={theme[field.key]}
                onChange={(event) => onChangeTheme(field.key, event.target.value)}
              />
            </label>
          ))}
        </div>
      </section>
      <section className="sidebar__card">
        <h3>Browse states</h3>
        <div className="sidebar__state-list">
          {states.map((state) => (
            <button
              key={state.abbreviation}
              type="button"
              className={`sidebar__state ${
                selectedState.abbreviation === state.abbreviation ? 'is-active' : ''
              }`}
              onClick={() => onSelectState(state)}
            >
              <span>{state.name}</span>
              <span className="sidebar__state-capital">{state.capital}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

Sidebar.propTypes = {
  selectedState: PropTypes.shape({
    name: PropTypes.string.isRequired,
    abbreviation: PropTypes.string.isRequired,
    capital: PropTypes.string.isRequired,
    nickname: PropTypes.string,
    population: PropTypes.string,
    region: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onSelectState: PropTypes.func.isRequired,
  states: PropTypes.arrayOf(PropTypes.object).isRequired,
  theme: PropTypes.object.isRequired,
  onChangeTheme: PropTypes.func.isRequired,
  onOpenExporter: PropTypes.func.isRequired,
};
