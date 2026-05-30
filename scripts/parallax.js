/**
 * Parallax Effect Module
 * Digital Business Card - Mary Kelsey
 * 
 * Brand: EOPeak
 * Developer: Eng. Eslam Osama Saad
 * 
 * This module implements a mouse-tracking parallax effect for background decorations.
 * Elements move at different speeds based on their depth factor, creating a 3D-like effect.
 * 
 * @module parallax
 */

/**
 * Parallax depth configuration for different element types
 * Higher depth values create more pronounced movement
 * @const {Object}
 */
const PARALLAX_DEPTH = {
  sparkles: {
    factor: 0.05,
    maxOffset: 40
  },
  stars: {
    factor: 0.03,
    maxOffset: 30
  },
  hearts: {
    factor: 0.04,
    maxOffset: 25
  }
};

/**
 * Applies parallax transform to a collection of elements
 * @param {NodeList} elements - Elements to apply parallax effect to
 * @param {number} mouseX - Normalized mouse X position (0-1)
 * @param {number} mouseY - Normalized mouse Y position (0-1)
 * @param {Object} config - Parallax configuration object
 * @param {string} [additionalTransform=''] - Additional transform to preserve
 */
function applyParallaxTransform(elements, mouseX, mouseY, config, additionalTransform = '') {
  elements.forEach((element, index) => {
    const depth = config.factor * ((index % 3) + 1);
    const moveX = (mouseX - 0.5) * depth * config.maxOffset;
    const moveY = (mouseY - 0.5) * depth * config.maxOffset;
    
    element.style.transform = `translate(${moveX}px, ${moveY}px) ${additionalTransform}`;
  });
}

/**
 * Mouse move event handler for parallax effect
 * @param {MouseEvent} e - Mouse event object
 */
function handleMouseMove(e) {
  // Normalize mouse position to 0-1 range
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;
  
  // Get all decoration elements
  const sparkles = document.querySelectorAll('.sparkle');
  const stars = document.querySelectorAll('.star');
  const hearts = document.querySelectorAll('.heart');
  
  // Apply parallax to each element type with appropriate transforms
  applyParallaxTransform(sparkles, mouseX, mouseY, PARALLAX_DEPTH.sparkles);
  applyParallaxTransform(stars, mouseX, mouseY, PARALLAX_DEPTH.stars, 'rotate(45deg)');
  applyParallaxTransform(hearts, mouseX, mouseY, PARALLAX_DEPTH.hearts, 'rotate(-45deg)');
}

/**
 * Enables the parallax effect by attaching mouse move listener
 * Only activates on screens wider than 768px for performance
 * 
 * @export
 */
export function enableParallax() {
  // Only enable parallax on larger screens for better performance
  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', handleMouseMove);
  }
}

/**
 * Disables the parallax effect by removing mouse move listener
 * Useful for cleanup or when user prefers reduced motion
 * 
 * @export
 */
export function disableParallax() {
  document.removeEventListener('mousemove', handleMouseMove);
}

