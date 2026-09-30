import type { Transition, Variants } from 'framer-motion'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const spring: {
  tilt: Transition
  hover: Transition
  press: Transition
  badge: Transition
} = {
  tilt: { stiffness: 150, damping: 18, mass: 0.8 },
  hover: { stiffness: 260, damping: 26, mass: 0.9 },
  press: { stiffness: 400, damping: 30, mass: 0.6 },
  badge: { stiffness: 300, damping: 22, mass: 0.8 },
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.22, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { type: 'tween', duration: 0.22, ease: EASE },
  },
}

export const revealContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'tween', duration: 0.4, ease: EASE },
  },
}

export const heroReveal: Variants = {
  hidden: { opacity: 0, y: 16, clipPath: 'inset(0 0 100% 0)' },
  show: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { type: 'tween', duration: 0.7, ease: EASE },
  },
}
