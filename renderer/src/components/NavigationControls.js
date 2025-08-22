import React from 'react';
import './NavigationControls.css';

const NavigationControls = ({ onBack, onForward, onRefresh, canGoBack, canGoForward, theme }) => {
  return (
    <div className={`navigation-controls ${theme} slide-in-left`}>
      <button 
        onClick={onBack} 
        disabled={!canGoBack}
        title="Go Back"
        className={`nav-button back ${!canGoBack ? 'disabled' : ''} click-effect`}
      >
        <span className="icon">◀</span>
        Back
      </button>
      
      <button 
        onClick={onForward} 
        disabled={!canGoForward}
        title="Go Forward"
        className={`nav-button forward ${!canGoForward ? 'disabled' : ''} click-effect`}
      >
        Forward
        <span className="icon">▶</span>
      </button>
      
      <button 
        onClick={onRefresh} 
        title="Refresh"
        className="nav-button refresh click-effect"
      >
        <span className="icon rotate">↻</span>
        Refresh
      </button>
    </div>
  );
};

export default NavigationControls;