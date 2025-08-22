import React, { useState, useEffect, useRef } from 'react';
import './AddressBar.css';
import Icons from '../icons';

const AddressBar = ({ onNavigate, theme, isLoading }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Common websites for suggestions
  const commonSites = [
    { url: 'google.com', icon: Icons.search },
    { url: 'youtube.com', icon: Icons.video },
    { url: 'github.com', icon: Icons.code },
    { url: 'twitter.com', icon: Icons.twitter },
    { url: 'facebook.com', icon: Icons.facebook },
    { url: 'linkedin.com', icon: Icons.linkedin },
    { url: 'amazon.com', icon: Icons.shopping },
    { url: 'netflix.com', icon: Icons.entertainment },
  ];

  // Generate suggestions based on input
  useEffect(() => {
    if (input.trim() === '') {
      // Show all common sites when input is empty
      setSuggestions(commonSites);
      return;
    }

    const filtered = commonSites.filter(site => 
      site.url.toLowerCase().includes(input.toLowerCase())
    );
    setSuggestions(filtered);
  }, [input]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    let url = input.trim();
    // Add https:// if not present and not a search query
    if (!url.startsWith('http') && !url.startsWith('www.') && !url.includes(' ') && !url.includes('.')) {
      // If no dot, treat as a search query
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    // If it contains spaces, treat as a search query
    else if (url.includes(' ')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    // If it starts with www. but not http
    else if (url.startsWith('www.') && !url.startsWith('http')) {
      url = 'https://' + url;
    }
    // If it has a domain format but no protocol
    else if (!url.startsWith('http') && url.includes('.')) {
      url = 'https://' + url;
    }
    
    onNavigate(url);
    setInput(url); // Update input with the processed URL
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.blur(); // Remove focus from input after submission
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const url = `https://${suggestion.url}`;
    onNavigate(url);
    setInput(suggestion.url);
    setShowSuggestions(false);
    // Force blur to ensure the input loses focus
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className={`address-bar ${theme} slide-in-left`}>
      <span className="address-bar-icon">{isLoading ? Icons.loading : Icons.globe}</span>
      <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex' }} className="scale-in">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or enter website name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
             // Generate suggestions immediately when focused
             if (input.trim() === '') {
               // Show common sites when input is empty
               setSuggestions(commonSites);
             }
             setShowSuggestions(true);
           }}
          onKeyDown={(e) => {
            // Handle keyboard navigation for suggestions
            if (e.key === 'Escape') {
              setShowSuggestions(false);
            } else if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
          disabled={false}
          className={isLoading ? 'input-loading' : ''}
          autoComplete="off"
        />
        <button type="submit" className="click-effect" disabled={isLoading}>{Icons.search}</button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions slide-in-top" ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <div 
              key={index} 
              className="suggestion-item hover-lift"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuggestionClick(suggestion);
              }}
            >
              <span className="suggestion-icon">{suggestion.icon}</span>
              {suggestion.url}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBar;


