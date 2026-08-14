/**
 * Physics utilities for non-linear rubber-band drag, progressive resistance,
 * and circular progress mapping.
 */

export const DEFAULT_THRESHOLD = 72; // Pixels needed for 100% completion
export const DEFAULT_MAX_PULL = 120; // Maximum physical translation of content
export const DEFAULT_RESISTANCE = 110; // Exponential resistance coefficient

/**
 * Calculates the non-linear elastic translation for a given raw finger pull distance.
 *
 * Uses the exponential saturation curve:
 * effectivePull = maxPull * (1 - exp(-rawPull / resistance))
 *
 * Properties:
 * - At rawPull = 0: effectivePull = 0
 * - As rawPull grows: slope smoothly decreases (feels increasingly stiff)
 * - As rawPull -> infinity: effectivePull approaches maxPull asymptotically
 *
 * @param rawPull The raw distance the user has dragged downward (positive in px).
 * @param maxPull The maximum translation limit in pixels.
 * @param resistance The resistance coefficient.
 */
export function calculateElasticPull(
  rawPull: number,
  maxPull: number = DEFAULT_MAX_PULL,
  resistance: number = DEFAULT_RESISTANCE,
): number {
  if (rawPull <= 0) return 0;
  if (resistance <= 0) return Math.min(rawPull, maxPull);

  const effective = maxPull * (1 - Math.exp(-rawPull / resistance));
  return Math.min(effective, maxPull);
}

/**
 * Calculates the normalized pull progress (0.0 to 1.0) based on raw pull distance
 * relative to the activation threshold.
 *
 * @param rawPull The raw downward distance in pixels.
 * @param threshold The distance required to achieve 100% completion.
 */
export function calculateProgress(
  rawPull: number,
  threshold: number = DEFAULT_THRESHOLD,
): number {
  if (rawPull <= 0) return 0;
  if (threshold <= 0) return 1;

  const normalized = rawPull / threshold;
  return Math.min(Math.max(normalized, 0), 1);
}

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates a value from an input range to an output range with clamping.
 */
export function interpolate(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  const clampedVal = clamp(value, Math.min(inMin, inMax), Math.max(inMin, inMax));
  const ratio = (clampedVal - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}
