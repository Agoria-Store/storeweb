export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

type NetInfo = { saveData?: boolean; effectiveType?: string };

export const constrainedNetwork = () => {
  const c = (navigator as Navigator & { connection?: NetInfo }).connection;
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''));
};

export const richMotionAllowed = () => !prefersReducedMotion() && !constrainedNetwork();
