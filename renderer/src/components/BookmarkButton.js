import React, { useState } from 'react';
import axios from 'axios';
import Icons from '../icons';

const BookmarkButton = ({ url }) => {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const handleSave = async () => {
    try {
      if (!url) return;
      setIsBookmarking(true);
      await axios.post('http://localhost:5000/api/bookmarks', { url }, { timeout: 1500 });
      alert('🔖 Bookmark saved!');
    } catch (err) {
      // Fallback: save to localStorage if API is unavailable
      try {
        const list = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const exists = list.some(b => b.url === url);
        if (!exists) {
          const title = document.title || url;
          list.push({ _id: `local-${Date.now()}`, title, url, date: new Date().toISOString(), local: true });
          localStorage.setItem('bookmarks', JSON.stringify(list));
        }
        alert('🔖 Bookmark saved locally. Backend not reachable.');
      } catch (_) {
        console.error('Failed to save bookmark:', err);
      }
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      className={`click-effect hover-grow ${isBookmarking ? 'pulse' : ''}`}
      style={{
        padding: '10px 16px',
        borderRadius: '30px',
        marginLeft: '10px',
        background: '#28a745',
        color: '#fff',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      }}
      disabled={isBookmarking}
    >
      {isBookmarking ? <><span style={{marginRight: '5px'}}>{Icons.loading}</span> Saving...</> : <><span style={{marginRight: '5px'}}>{Icons.bookmarkAdd}</span> Bookmark</>}
    </button>
  );
};

export default BookmarkButton;


