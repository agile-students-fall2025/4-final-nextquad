import { useState } from 'react';
import './ImageCarousel.css';

export default function ImageCarousel({ images, altText, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const goToPrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // If only one image, display it simply
  if (images.length === 1) {
    return (
      <img 
        src={images[0]} 
        alt={altText} 
        className="feed-post-image" 
        onClick={() => onImageClick && onImageClick({ url: images[0], alt: altText, index: 0 })}
      />
    );
  }

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        <img 
          src={images[currentIndex]} 
          alt={`${altText} ${currentIndex + 1}`} 
          className="feed-post-image carousel-image"
          onClick={() => onImageClick && onImageClick({ url: images[currentIndex], alt: altText, index: currentIndex })}
        />
        
        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow carousel-arrow-left" 
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          ‹
        </button>
        <button 
          className="carousel-arrow carousel-arrow-right" 
          onClick={goToNext}
          aria-label="Next image"
        >
          ›
        </button>
        
        {/* Image Counter */}
        <div className="carousel-counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
      
      {/* Dots Indicator */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={(e) => goToSlide(index, e)}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
