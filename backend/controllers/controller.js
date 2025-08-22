const Bookmark = require('../models/Bookmark');
const axios = require('axios');
const Parser = require('rss-parser');
const rssParser = new Parser();

// Get all bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find().sort({ date: -1 });
    res.json(bookmarks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to load bookmarks' });
  }
};

// Create a bookmark with metadata enrichment
exports.createBookmark = async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Normalize URL to include protocol
  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

  try {
    // Try to fetch page to extract title and a favicon
    let title;
    let favicon;
    try {
      const resp = await axios.get(normalizedUrl, { timeout: 4000 });
      const html = resp.data || '';
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : undefined;
      // Try common favicon link patterns
      const iconMatch = html.match(/<link[^>]+rel=["'](?:shortcut icon|icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i);
      if (iconMatch && iconMatch[1]) {
        const iconHref = iconMatch[1];
        if (/^https?:\/\//i.test(iconHref)) {
          favicon = iconHref;
        } else if (iconHref.startsWith('//')) {
          favicon = `https:${iconHref}`;
        } else {
          // Resolve relative to origin
          const origin = new URL(normalizedUrl).origin;
          favicon = `${origin}${iconHref.startsWith('/') ? '' : '/'}${iconHref}`;
        }
      } else {
        // Fallback to Google favicon service
        const domain = new URL(normalizedUrl).hostname;
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      }
    } catch (metaErr) {
      // On failure, fallback to domain-based favicon
      const domain = new URL(normalizedUrl).hostname;
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }

    const bookmark = await Bookmark.create({ url: normalizedUrl, title, favicon });
    res.status(201).json(bookmark);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to save bookmark' });
  }
};

// Import bookmarks (bulk insert)
exports.importBookmarks = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({ error: 'Invalid bookmark data' });
    }
    
    await Bookmark.insertMany(req.body);
    res.status(201).json({ message: 'Bookmarks imported successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to import bookmarks' });
  }
};

// Delete bookmark by ID
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    
    await Bookmark.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bookmark deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete bookmark' });
  }
};

// Get aggregated news from multiple RSS feeds
exports.getNews = async (req, res) => {
  try {
    const sources = [
      'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
      'https://feeds.bbci.co.uk/news/world/rss.xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'
    ];
    const results = await Promise.allSettled(sources.map((s) => rssParser.parseURL(s)));
    const items = results.flatMap(r => r.status === 'fulfilled' ? (r.value.items || []) : []);
    // Normalize and pick top N by published date
    const normalized = items.map(i => ({
      title: i.title,
      link: i.link,
      pubDate: i.isoDate || i.pubDate || new Date().toISOString(),
      source: (i.creator || i.author || (i.link ? new URL(i.link).hostname : 'news'))
    }));
    normalized.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));
    res.json({ items: normalized.slice(0, 40) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};