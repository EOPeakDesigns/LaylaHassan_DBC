/**
 * Background Decorations Generator
 * Digital Business Card - Mary Kelsey
 * 
 * Brand: EOPeak
 * Developer: Eng. Eslam Osama Saad
 * 
 * This module handles the creation of decorative background elements:
 * - Sparkles: Radial gradient circles of varying sizes
 * - Stars: Geometric star shapes with rotating patterns
 * - Hearts: CSS-only heart shapes using pseudo-elements
 * 
 * @module decorations
 */

/**
 * Configuration for background decorations
 * @const {Object}
 */
const DECORATION_CONFIG = {
  sparkles: {
    count: 15,
    minSize: 3,
    maxSize: 13
  },
  stars: {
    count: 10,
    minSize: 3,
    maxSize: 9,
    colors: ['var(--color-pink)', 'var(--color-sky)', 'var(--color-mint)']
  },
  hearts: {
    count: 5
  }
};

/**
 * Creates sparkle elements with random positioning and sizing
 * @param {HTMLElement} container - The container element to append sparkles to
 * @param {number} windowWidth - Current window width for positioning
 * @param {number} windowHeight - Current window height for positioning
 */
function createSparkles(container, windowWidth, windowHeight) {
  const { count, minSize, maxSize } = DECORATION_CONFIG.sparkles;
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');
    
    const size = Math.random() * (maxSize - minSize) + minSize;
    const left = Math.random() * windowWidth;
    const top = Math.random() * windowHeight;
    
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${left}px`;
    sparkle.style.top = `${top}px`;
    
    container.appendChild(sparkle);
  }
}

/**
 * Creates star elements with random positioning, sizing, and colors
 * @param {HTMLElement} container - The container element to append stars to
 * @param {number} windowWidth - Current window width for positioning
 * @param {number} windowHeight - Current window height for positioning
 */
function createStars(container, windowWidth, windowHeight) {
  const { count, minSize, maxSize, colors } = DECORATION_CONFIG.stars;
  
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    
    const size = Math.random() * (maxSize - minSize) + minSize;
    const left = Math.random() * windowWidth;
    const top = Math.random() * windowHeight;
    const color = colors[i % colors.length];
    
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${left}px`;
    star.style.top = `${top}px`;
    star.style.background = color;
    
    container.appendChild(star);
  }
}

/**
 * Creates heart elements with random positioning
 * @param {HTMLElement} container - The container element to append hearts to
 * @param {number} windowWidth - Current window width for positioning
 * @param {number} windowHeight - Current window height for positioning
 */
function createHearts(container, windowWidth, windowHeight) {
  const { count } = DECORATION_CONFIG.hearts;
  
  for (let i = 0; i < count; i++) {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    const left = Math.random() * windowWidth;
    const top = Math.random() * windowHeight;
    
    heart.style.left = `${left}px`;
    heart.style.top = `${top}px`;
    
    container.appendChild(heart);
  }
}

/**
 * Main function to create all background decoration elements
 * Orchestrates the creation of sparkles, stars, and hearts
 * 
 * @export
 */
export function createBackgroundElements() {
  const bgDecoration = document.getElementById('bg-decoration');
  
  if (!bgDecoration) {
    return;
  }
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Create all decoration types
  createSparkles(bgDecoration, windowWidth, windowHeight);
  createStars(bgDecoration, windowWidth, windowHeight);
  createHearts(bgDecoration, windowWidth, windowHeight);
}

