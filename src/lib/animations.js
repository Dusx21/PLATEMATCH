/**
 * PlateMatch Brand v2 - Motion & Interaction System
 * Inspired by Hover.dev & Motion for React
 * Focused on 60fps GPU acceleration (transform & opacity only)
 */

export const transitions = {
  // Snappy for buttons, micro-interactions, toggles
  snappy: { type: 'spring', stiffness: 480, damping: 28, mass: 0.8 },
  // Smooth for page loads, cards, drawers
  smooth: { type: 'spring', stiffness: 320, damping: 26, mass: 1 },
  // Bouncy for matches, celebrations, achievements
  bouncy: { type: 'spring', stiffness: 420, damping: 18, mass: 1 },
  // Gentle for slow ambient shifts
  gentle: { type: 'spring', stiffness: 200, damping: 24 },
  // Quick ease for dropdowns/popovers
  fastEase: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.smooth,
  },
};

export const buttonInteractions = {
  hover: { y: -1.5, scale: 1.015, transition: transitions.snappy },
  tap: { y: 0, scale: 0.96, transition: transitions.snappy },
};

export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
};

export const sheetVariants = {
  hidden: { y: '100%', opacity: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 340, damping: 30, mass: 0.9 },
  },
  exit: {
    y: '100%',
    opacity: 0.9,
    transition: { duration: 0.22, ease: [0.32, 0, 0.67, 0] },
  },
};

export const dialogVariants = {
  hidden: { scale: 0.94, opacity: 0, y: 12 },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: transitions.snappy,
  },
  exit: {
    scale: 0.96,
    opacity: 0,
    y: 8,
    transition: { duration: 0.16, ease: 'easeIn' },
  },
};
