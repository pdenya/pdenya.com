/**
 * input.js - Shared pointer / scroll / preference state for the background layers
 */
export const input = {
  // Smoothed pointer position, -1..1 (0,0 = center). Mouse only.
  px: 0,
  py: 0,
  // Raw pointer target
  tx: 0,
  ty: 0,
  // 0..1, fades in when a mouse is moving over the page, out when it leaves
  pointerOn: 0,
  pointerTarget: 0,
  // Smoothed scroll position in px
  scroll: 0,
  scrollTarget: 0,
  // 0..1 through the page (0 at the top, 1 at the very bottom)
  progress: 0,
  reduced: false,
  small: false,
  listeners: new Set(),
};

let started = false;

/** Call fn() whenever the user moves the pointer or scrolls (used to wake the render loop) */
export function onActivity(fn) {
  input.listeners.add(fn);
}

export function startInput() {
  if (started) return;
  started = true;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  input.reduced = motion.matches;
  motion.addEventListener?.('change', (e) => { input.reduced = e.matches; });
  input.small = window.innerWidth < 768;
  input.scroll = input.scrollTarget = window.scrollY;

  const wake = () => input.listeners.forEach((fn) => fn());

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    input.tx = (e.clientX / window.innerWidth) * 2 - 1;
    input.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    input.pointerTarget = 1;
    wake();
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => { input.pointerTarget = 0; });

  window.addEventListener('scroll', () => {
    input.scrollTarget = window.scrollY;
    wake();
  }, { passive: true });

  window.addEventListener('resize', () => { input.small = window.innerWidth < 768; });
}

/** Ease the smoothed values toward their targets. Call once per rendered frame. */
export function tickInput(delta) {
  const k = 1 - Math.exp(-delta * 6);
  input.px += (input.tx - input.px) * k;
  input.py += (input.ty - input.py) * k;
  input.pointerOn += (input.pointerTarget - input.pointerOn) * k;
  input.scroll += (input.scrollTarget - input.scroll) * (1 - Math.exp(-delta * 12));
  const range = document.documentElement.scrollHeight - window.innerHeight;
  // Pages too short to scroll sit partway along the journey
  input.progress = range > 40 ? Math.min(1, Math.max(0, input.scroll / range)) : 0.55;
}

/** True while smoothed values are still catching up to their targets */
export function inputSettling() {
  return Math.abs(input.tx - input.px) > 0.002
    || Math.abs(input.ty - input.py) > 0.002
    || Math.abs(input.scrollTarget - input.scroll) > 0.5
    || Math.abs(input.pointerTarget - input.pointerOn) > 0.01;
}
