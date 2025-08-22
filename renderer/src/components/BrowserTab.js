import React, { useState, useEffect, useRef } from 'react';
import NavigationControls from './NavigationControls';
import './BrowserTab.css';
import Icons from '../icons';

const BrowserTab = ({ url, theme, onLoadingChange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [loadProgress, setLoadProgress] = useState(0);
  const iframeRef = useRef(null);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    // Reset states when URL changes from outside (not from navigation)
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    setError(null);
    startProgressAnimation();
    
    // Add to history only if it's a new URL from outside navigation
    if (history[currentHistoryIndex] !== url) {
      // If we navigated back and then got a new URL, truncate the forward history
      const newHistory = currentHistoryIndex >= 0 
        ? history.slice(0, currentHistoryIndex + 1) 
        : [];
      
      setHistory([...newHistory, url]);
      setCurrentHistoryIndex(newHistory.length);
      setCanGoBack(newHistory.length > 0);
      setCanGoForward(false);
    }

    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, [url]);

  const startProgressAnimation = () => {
    setLoadProgress(0);
    // Simulate progress until page is actually loaded
    const updateProgress = () => {
      setLoadProgress(prev => {
        const next = prev + (100 - prev) * 0.1;
        if (next > 95) return 95; // Cap at 95% until actual load completes
        return next;
      });

      progressTimerRef.current = setTimeout(updateProgress, 200);
    };

    updateProgress();
  };

  const handleLoad = () => {
    // Clear any existing progress timer
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
    }
    
    // Complete the progress bar
    setLoadProgress(100);
    
    // Hide progress bar and show content after a short delay
    setTimeout(() => {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }, 300);
  };

  const handleError = () => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
    }
    setLoading(false);
    if (onLoadingChange) onLoadingChange(false);
    // Silently open externally on load error to avoid user interruption
    openInNewTab();
  };

  const openInNewTab = () => {
    // Use Electron's API if available, otherwise use window.open
    if (window.electronAPI) {
      window.electronAPI.sendToMain('openExternal', url);
    } else {
      window.open(url, '_blank');
    }
  };

  // Navigation handlers
  const handleBack = () => {
    if (canGoBack && currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      setLoading(true);
      setError(null);
      startProgressAnimation();
      
      // Update iframe src to the previous URL in history
      if (iframeRef.current) {
        iframeRef.current.src = history[newIndex];
      }
    }
  };

  const handleForward = () => {
    if (canGoForward && currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
      setLoading(true);
      setError(null);
      startProgressAnimation();
      
      // Update iframe src to the next URL in history
      if (iframeRef.current) {
        iframeRef.current.src = history[newIndex];
      }
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    startProgressAnimation();
    
    // Force iframe refresh
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 50);
    }
  };

  // Get the current URL from history based on navigation
  const currentUrl = history[currentHistoryIndex] || url;

  // Extract domain for display
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  return (
    <div className={`browser-tab-container ${theme} scale-in`}>
      {loading && (
        <div className="progress-bar" style={{ width: `${loadProgress}%`, transition: 'width 0.3s ease-out' }} />
      )}
      
      <NavigationControls 
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        theme={theme}
      />
      
      {loading && (
        <div className="loading-indicator fade-in">
          <div className="spinner rotate">{Icons.loading}</div>
          <p className="pulse">Loading {getDomain(currentUrl)}...</p>
        </div>
      )}
      
      {null}
      
      <iframe
        ref={iframeRef}
        src={currentUrl}
        title="Web View"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
};

export default BrowserTab;

