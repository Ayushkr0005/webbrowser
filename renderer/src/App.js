
import { useState, useRef, useEffect } from 'react';
import './App.css';
import './animations.css';
import './responsive.css';
import AddressBar from './components/AddressBar';
import BookmarkButton from './components/BookmarkButton';
import BookmarkList from './components/BookmarkList';
import BrowserTab from './components/BrowserTab';
import NewsFeed from './components/NewsFeed';
import Icons from './icons';
import './components/NewsFeed.css';

function App() {
  const [tabs, setTabs] = useState([{ id: 1, name: 'Tab 1', url: localStorage.getItem('homepage') || 'https://news.google.com', loading: false }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(() => {
    return {
      homepage: localStorage.getItem('homepage') || 'https://news.google.com',
      searchEngine: localStorage.getItem('searchEngine') || 'google',
    };
  });
  const browserRef = useRef();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Restrict sites known to block iframe embedding
  const iframeRestrictedSites = [
    'google.com',
    'bing.com',
    'duckduckgo.com',
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'github.com'
  ];

  const handleNavigate = (input) => {
    let finalUrl;
    if (input.startsWith('http')) {
      finalUrl = input;
    } else if (input.includes('.')) {
      finalUrl = `https://${input}`;
    } else {
      const searchMap = {
        google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
        duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      };
      const builder = searchMap[settings.searchEngine] || searchMap.google;
      finalUrl = builder(input);
    }

    const isRestricted = iframeRestrictedSites.some((site) => finalUrl.includes(site));
    if (isRestricted) {
      window.open(finalUrl, '_blank');
      return;
    }

    setTabs((prevTabs) =>
      prevTabs.map((tab) => tab.id === activeTabId ? { ...tab, url: finalUrl, loading: true } : tab)
    );

    setTimeout(() => {
      browserRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddTab = () => {
    const newId = Date.now();
    const tabNumber = tabs.length + 1;
    setTabs([...tabs, { id: newId, name: `Tab ${tabNumber}`, url: settings.homepage }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id) => {
    // Prevent closing the last tab
    if (tabs.length <= 1) {
      return;
    }
    
    const filtered = tabs.filter((tab) => tab.id !== id);
    setTabs(filtered);
    if (activeTabId === id && filtered.length > 0) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const currentTab = tabs.find((tab) => tab.id === activeTabId);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        handleAddTab();
      } else if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        document.querySelector('.address-bar input')?.focus();
      } else if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTabId, tabs]);

  return (
  <div className={`app-container ${theme} fade-in`}>
    {/* Header with Theme Toggle and Tabs */}
    <header className="browser-header slide-in-top">
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-toggle-btn click-effect">
          {theme === 'light' ? Icons.moon : Icons.sun}
        </button>
      </div>
      
      {/* Tabs */}
      <div className="tabs-container slide-in-top">
        {tabs.map((tab, index) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? 'active' : ''} hover-lift`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <img src={`https://www.google.com/s2/favicons?domain=${tab.url}`} alt="" style={{width: '16px', height: '16px'}} />
            {tab.name || `Tab ${index + 1}`}
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
              className="tab-close"
            >
              <span style={{ width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {Icons.close}
              </span>
            </span>
          </div>
        ))}
        <button onClick={handleAddTab} className="new-tab-btn click-effect">{Icons.add}</button>
      </div>
    </header>

    <main className="browser-content">
      {/* Address Bar + Bookmark */}
      <div className="toolbar slide-in-left">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <button className="nav-button click-effect" onClick={() => {
            const iframe = browserRef.current?.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              try {
                iframe.contentWindow.history.back();
              } catch (error) {
                console.error('Error navigating back:', error);
              }
            }
          }}>
            {Icons.back}
          </button>
          <button className="nav-button click-effect" onClick={() => {
            const iframe = browserRef.current?.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              try {
                iframe.contentWindow.history.forward();
              } catch (error) {
                console.error('Error navigating forward:', error);
              }
            }
          }}>
            {Icons.forward}
          </button>
          <button className="nav-button click-effect" onClick={() => {
            const iframe = browserRef.current?.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
              try {
                iframe.contentWindow.location.reload();
              } catch (error) {
                console.error('Error reloading page:', error);
              }
            }
          }}>
            {Icons.refresh}
          </button>
        </div>
        <AddressBar 
          onNavigate={handleNavigate} 
          theme={theme} 
          isLoading={tabs.find(tab => tab.id === activeTabId)?.loading || false} 
        />
        <BookmarkButton url={currentTab?.url} />
      </div>

      <BookmarkList onSelect={handleNavigate} theme={theme} className="slide-in-left" />
      <div ref={browserRef} className="browser-view scale-in">
        {currentTab && currentTab.url === 'https://news.google.com' ? (
          <NewsFeed theme={theme} />
        ) : (
          <BrowserTab 
            url={currentTab.url} 
            theme={theme} 
            onLoadingChange={(isLoading) => {
              setTabs(prevTabs => 
                prevTabs.map(tab => 
                  tab.id === activeTabId ? { ...tab, loading: isLoading } : tab
                )
              );
            }}
          />
        )}
      </div>
    </main>
  </div>
);
}

export default App;
