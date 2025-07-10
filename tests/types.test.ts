/**
 * Tests for TypeScript types and enums
 */

import { ColorBlindnessType } from '../src/types';

describe('ColorBlindnessType Enum', () => {
  test('should contain all expected color blindness types', () => {
    const expectedTypes = [
      'protanopia',
      'protanomaly', 
      'deuteranopia',
      'deuteranomaly',
      'tritanopia',
      'tritanomaly',
      'achromatopsia',
      'achromatomaly'
    ];

    expectedTypes.forEach(type => {
      expect(Object.values(ColorBlindnessType)).toContain(type);
    });
  });

  test('should have exactly 8 color blindness types', () => {
    expect(Object.values(ColorBlindnessType)).toHaveLength(8);
  });

  test('enum values should be strings', () => {
    Object.values(ColorBlindnessType).forEach(value => {
      expect(typeof value).toBe('string');
    });
  });
}); 