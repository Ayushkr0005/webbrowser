import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BookmarkList.css';
import Icons from '../icons';

const BookmarkList = ({ onSelect, theme, className }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');

  // Mock data to use when API is unavailable
  const mockBookmarks = [
    { _id: '1', title: 'Google', url: 'https://www.google.com' },
    { _id: '2', title: 'GitHub', url: 'https://www.github.com' },
    { _id: '3', title: 'YouTube', url: 'https://www.youtube.com' },
    { _id: '4', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { _id: '5', title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }
  ];

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bookmarks', { timeout: 1000 });
      setBookmarks(res.data);
    } catch (err) {
      // Merge localStorage bookmarks if API unavailable
      try {
        const local = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setBookmarks(local.length ? local : mockBookmarks);
      } catch (_) {
        setBookmarks(mockBookmarks);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteBookmark = async (id, e) => {
    e.stopPropagation(); // Prevent triggering the bookmark click
    try {
      await axios.delete(`http://localhost:5000/api/bookmarks/${id}`, { timeout: 1000 });
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      // Local delete when API is unavailable
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      const local = JSON.parse(localStorage.getItem('bookmarks') || '[]').filter((b) => b._id !== id);
      localStorage.setItem('bookmarks', JSON.stringify(local));
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Extract domain from URL for display and favicon
  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (e) {
      return url;
    }
  };

  // Get favicon for the bookmark
  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch (e) {
      return null;
    }
  };

  // Compute filtered/sorted
  const normalized = (s) => (s || '').toLowerCase();
  const filtered = bookmarks.filter((b) => {
    const text = `${b.title || ''} ${b.url}`;
    return normalized(text).includes(normalized(query));
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title') {
      return (a.title || a.url).localeCompare(b.title || b.url);
    }
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className={`bookmark-list ${theme} ${className || ''}`}>
      <h3>
        <span className="bookmark-icon">{Icons.bookmark}</span> Bookmarks
      </h3>
      <div style={{display:'flex', gap:8, marginBottom:8}}>
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          style={{flex:1, padding:'6px 10px', border:'1px solid #ccc', borderRadius:8}}
        />
        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} style={{padding:'6px 10px', border:'1px solid #ccc', borderRadius:8}}>
          <option value="date">Newest</option>
          <option value="title">Title</option>
        </select>
      </div>
      
      {loading ? (
        <div className="bookmarks-container">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-bookmark"></div>
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="bookmarks-container">
          {sorted.map((bookmark) => (
            <div 
              key={bookmark._id} 
              className="bookmark-item hover-lift"
              onClick={() => onSelect(bookmark.url)}
            >
              <img 
                src={bookmark.favicon || getFavicon(bookmark.url)} 
                alt="" 
                className="bookmark-favicon" 
              />
              <span className="bookmark-link" title={bookmark.title || bookmark.url}>
                {bookmark.title || getDomain(bookmark.url)}
              </span>
              <span 
                className="bookmark-delete click-effect"
                onClick={(e) => deleteBookmark(bookmark._id, e)}
                title="Delete bookmark"
              >
                {Icons.close}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-bookmarks">
          <span>No bookmarks yet</span>
          <span>Add bookmarks by clicking the bookmark button in the address bar</span>
        </div>
      )}
    </div>
  );
};

export default BookmarkList;

