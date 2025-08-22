import React, { useEffect, useState } from 'react';
import './FeedCarousel.css';

const images = [
  '/assets/feed_image_1.png',
  '/assets/feed_image_2.png'
];

const FeedCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000); // change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="feed-carousel">
      <img src={images[index]} alt={`Feed ${index}`} className="carousel-image" />
    </div>
  );
};

export default FeedCarousel;

