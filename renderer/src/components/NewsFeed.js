import React, { useState, useEffect, useMemo } from 'react';
import './NewsFeed.css';
import Icons from '../icons';

const NewsFeed = ({ theme }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/news');
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => setTick(t => t + 1), 8000); // rotate highlight
    const refresh = setInterval(fetchNews, 60 * 1000); // refresh every minute
    return () => { clearInterval(interval); clearInterval(refresh); };
  }, []);

  const groups = useMemo(() => {
    const byCategory = {
      Technology: [],
      Business: [],
      Science: [],
      Entertainment: []
    };

    const techHosts = ['techcrunch', 'theverge', 'wired', 'arstechnica', '9to5', 'gsmarena', 'engadget'];
    const bizHosts = ['wsj', 'bloomberg', 'marketwatch', 'financial', 'forbes', 'ft.com', 'cnbc'];
    const sciHosts = ['nasa', 'space', 'sciencemag', 'nature'];
    const entHosts = ['variety', 'hollywoodreporter', 'rollingstone'];

    const inAny = (text, arr) => arr.some(k => text.includes(k));

    const chooseCategory = (title, url) => {
      const t = (title || '').toLowerCase();
      const host = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ''; } })();
      if (
        t.match(/\b(tech|technology|ai|software|app|gadget|smartphone|chip|semiconductor|openai|google|apple|microsoft|meta)\b/) ||
        inAny(host, techHosts)
      ) return 'Technology';
      if (
        t.match(/\b(business|market|stock|stocks|economy|economic|finance|funding|startup|revenue|company|merger|ipo)\b/) ||
        inAny(host, bizHosts)
      ) return 'Business';
      if (
        t.match(/\b(science|space|nasa|research|study|biology|physics|chemistry|astronomy|quantum)\b/) ||
        inAny(host, sciHosts)
      ) return 'Science';
      if (
        t.match(/\b(entertainment|movie|music|film|tv|series|celebrity|netflix|disney|bollywood|hollywood)\b/) ||
        inAny(host, entHosts)
      ) return 'Entertainment';
      // Default bucket by simple heuristics
      return 'Business';
    };

    items.forEach(it => {
      const cat = chooseCategory(it.title, it.link);
      byCategory[cat].push(it);
    });

    // If some categories are sparse, backfill from the overall pool
    const pool = [...items];
    Object.keys(byCategory).forEach((key) => {
      if (byCategory[key].length < 5) {
        const needed = 5 - byCategory[key].length;
        const extras = pool.filter(p => !byCategory[key].includes(p)).slice(0, needed);
        byCategory[key].push(...extras);
      }
    });

    return byCategory;
  }, [items]);

  if (loading) {
    return (
      <div className={`news-feed ${theme}`}>
        <h2>Today's Top Stories</h2>
        <div className="feed-container">
          {[1, 2, 3, 4].map(skeleton => (
            <div key={skeleton} className="feed-category skeleton-card">
              <div className="skeleton-title"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categories = [
    { key: 'Technology', icon: Icons.technology },
    { key: 'Business', icon: Icons.business },
    { key: 'Science', icon: Icons.science },
    { key: 'Entertainment', icon: Icons.entertainment }
  ];

  return (
    <div className={`news-feed ${theme}`}>
      <h2>Today's Top Stories</h2>
      <div className="feed-container">
        {categories.map((cat, idx) => {
          const list = (groups[cat.key] || []).slice(0, 5);
          return (
            <div key={cat.key} className="feed-category">
              <h3>
                <span className="category-icon">{cat.icon}</span>
                {cat.key}
              </h3>
              <ul>
                {list.map((item, i) => (
                  <li key={`${cat.key}-${i}`} className={i === tick % 5 ? 'pulse' : ''}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;