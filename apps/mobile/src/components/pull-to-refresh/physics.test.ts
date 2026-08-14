import {
  calculateElasticPull,
  calculateProgress,
  clamp,
  interpolate,
} from './physics';

describe('Pull-to-Refresh Physics & Math', () => {
  describe('calculateElasticPull', () => {
    it('returns 0 when rawPull is 0 or negative', () => {
      expect(calculateElasticPull(0)).toBe(0);
      expect(calculateElasticPull(-10)).toBe(0);
      expect(calculateElasticPull(-100)).toBe(0);
    });

    it('exhibits monotonic increasing behavior with decreasing rate of return (rubber-band)', () => {
      const p10 = calculateElasticPull(10);
      const p20 = calculateElasticPull(20);
      const p40 = calculateElasticPull(40);
      const p80 = calculateElasticPull(80);
      const p160 = calculateElasticPull(160);

      // Must strictly increase
      expect(p20).toBeGreaterThan(p10);
      expect(p40).toBeGreaterThan(p20);
      expect(p80).toBeGreaterThan(p40);
      expect(p160).toBeGreaterThan(p80);

      // Marginal gain must decrease (concave down / resistance increases)
      const delta1 = p20 - p10; // gain from 10->20
      const delta2 = p40 - p20; // gain from 20->40 (over 20px)
      const delta3 = p80 - p40; // gain from 40->80 (over 40px)

      expect(delta1 / 10).toBeGreaterThan(delta2 / 20);
      expect(delta2 / 20).toBeGreaterThan(delta3 / 40);
    });

    it('never exceeds maxPull regardless of extreme drag distance', () => {
      const maxPull = 120;
      expect(calculateElasticPull(1000, maxPull)).toBeLessThanOrEqual(maxPull);
      expect(calculateElasticPull(10000, maxPull)).toBeLessThanOrEqual(maxPull);
      expect(calculateElasticPull(1000000, maxPull)).toBeLessThanOrEqual(maxPull);
    });

    it('handles zero or negative resistance gracefully', () => {
      expect(calculateElasticPull(50, 100, 0)).toBe(50);
      expect(calculateElasticPull(150, 100, 0)).toBe(100);
      expect(calculateElasticPull(50, 100, -10)).toBe(50);
    });
  });

  describe('calculateProgress', () => {
    it('returns 0 at 0 or negative rawPull', () => {
      expect(calculateProgress(0, 72)).toBe(0);
      expect(calculateProgress(-50, 72)).toBe(0);
    });

    it('returns 0.5 at half threshold', () => {
      expect(calculateProgress(36, 72)).toBeCloseTo(0.5, 4);
    });

    it('returns 1.0 exactly at threshold', () => {
      expect(calculateProgress(72, 72)).toBe(1);
    });

    it('clamps to 1.0 when exceeding threshold', () => {
      expect(calculateProgress(100, 72)).toBe(1);
      expect(calculateProgress(500, 72)).toBe(1);
    });

    it('handles invalid threshold safely', () => {
      expect(calculateProgress(10, 0)).toBe(1);
      expect(calculateProgress(10, -5)).toBe(1);
    });
  });

  describe('clamp & interpolate', () => {
    it('clamps numbers to min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('interpolates numbers accurately with bounding clamp', () => {
      expect(interpolate(0, 0, 100, 10, 20)).toBe(10);
      expect(interpolate(50, 0, 100, 10, 20)).toBe(15);
      expect(interpolate(100, 0, 100, 10, 20)).toBe(20);
      expect(interpolate(150, 0, 100, 10, 20)).toBe(20); // clamped
      expect(interpolate(-50, 0, 100, 10, 20)).toBe(10); // clamped
    });
  });
});
