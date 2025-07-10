/**
 * Tests for Color Blindness Simulator
 * 
 * Tests the Brettel-Viénot-Mollon algorithm implementation
 */

import {
  simulate,
  protanopia,
  protanomaly,
  deuteranopia,
  deuteranomaly,
  tritanopia,
  tritanomaly,
  achromatopsia,
  achromatomaly,
  ColorBlindnessType
} from '../src/color-blindness-simulator';
import type { RGBColor } from '../src/types';

describe('Color Blindness Functions', () => {
  
  // Helper function to convert hex to RGB for testing RGB values
  const hexToRgb = (hex: string): RGBColor => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { R: r, G: g, B: b };
  };

  // Helper function to check if RGB values are valid
  const isValidRGB = (rgb: RGBColor): boolean => {
    return rgb.R >= 0 && rgb.R <= 255 &&
           rgb.G >= 0 && rgb.G <= 255 &&
           rgb.B >= 0 && rgb.B <= 255 &&
           Number.isInteger(rgb.R) &&
           Number.isInteger(rgb.G) &&
           Number.isInteger(rgb.B);
  };

  // Helper function to check if a hex color represents grayscale (R=G=B)
  const isGrayscale = (hex: string): boolean => {
    const rgb = hexToRgb(hex);
    return rgb.R === rgb.G && rgb.G === rgb.B;
  };

  describe('Input Format Handling', () => {
    test('should handle hex string input', () => {
      const result = protanopia('#FF0000');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle RGB object input', () => {
      const result = protanopia({ R: 255, G: 0, B: 0 });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle RGB array input', () => {
      const result = protanopia([255, 0, 0]);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle lowercase hex input', () => {
      const result = protanopia('#ff0000');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid hex format', () => {
      expect(() => {
        protanopia('#GGG');
      }).toThrow();
    });

    test('should throw error for short hex string', () => {
      expect(() => {
        protanopia('#FF');
      }).toThrow();
    });

    test('should throw error for invalid RGB array length', () => {
      expect(() => {
        protanopia([255, 0] as any);
      }).toThrow();
    });

    test('should throw error for empty string', () => {
      expect(() => {
        protanopia('');
      }).toThrow();
    });
  });

  describe('Result Format', () => {
    test('simulate should return hex string', () => {
      const result = simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should return valid hex colors with valid RGB values', () => {
      const result = simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
      
      // Verify RGB values are valid
      const rgb = hexToRgb(result);
      expect(isValidRGB(rgb)).toBe(true);
    });
  });

  describe('Color Preservation Properties', () => {
    test('should process gray colors correctly', () => {
      const gray = '#808080';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = simulate(gray, { type });
        expect(typeof result).toBe('string');
        expect(result).toMatch(/^#[0-9A-F]{6}$/);
        
        // For achromatopsia/achromatomaly, should be perfect gray
        if (type === 'achromatopsia' || type === 'achromatomaly') {
          expect(isGrayscale(result)).toBe(true);
        }
      });
    });

    test('should preserve black color approximately', () => {
      const black = '#000000';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = simulate(black, { type });
        expect(result).toMatch(/^#[0-9A-F]{6}$/);
        
        const rgb = hexToRgb(result);
        expect(isValidRGB(rgb)).toBe(true);
        
        // Should be very dark (all components < 30)
        expect(rgb.R).toBeLessThan(30);
        expect(rgb.G).toBeLessThan(30);
        expect(rgb.B).toBeLessThan(30);
      });
    });

    test('should preserve white color approximately', () => {
      const white = '#FFFFFF';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = simulate(white, { type });
        expect(result).toMatch(/^#[0-9A-F]{6}$/);
        
        const rgb = hexToRgb(result);
        expect(isValidRGB(rgb)).toBe(true);
        
        // Should be very bright (all components > 225)
        expect(rgb.R).toBeGreaterThan(225);
        expect(rgb.G).toBeGreaterThan(225);
        expect(rgb.B).toBeGreaterThan(225);
      });
    });
  });

  describe('Specific Color Blindness Types', () => {
    test('protanopia should affect red perception', () => {
      const redResult = simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
      const greenResult = simulate('#00FF00', { type: ColorBlindnessType.Protanopia });
      
      expect(typeof redResult).toBe('string');
      expect(typeof greenResult).toBe('string');
      expect(redResult).toMatch(/^#[0-9A-F]{6}$/);
      expect(greenResult).toMatch(/^#[0-9A-F]{6}$/);
      
      // Red should be significantly changed in protanopia
      expect(redResult).not.toBe('#FF0000');
    });

    test('deuteranopia should affect green perception', () => {
      const greenResult = simulate('#00FF00', { type: ColorBlindnessType.Deuteranopia });
      const blueResult = simulate('#0000FF', { type: ColorBlindnessType.Deuteranopia });
      
      expect(typeof greenResult).toBe('string');
      expect(typeof blueResult).toBe('string');
      expect(greenResult).toMatch(/^#[0-9A-F]{6}$/);
      expect(blueResult).toMatch(/^#[0-9A-F]{6}$/);
      
      // Green should be significantly changed in deuteranopia
      expect(greenResult).not.toBe('#00FF00');
    });

    test('tritanopia should affect blue perception', () => {
      const blueResult = simulate('#0000FF', { type: ColorBlindnessType.Tritanopia });
      const redResult = simulate('#FF0000', { type: ColorBlindnessType.Tritanopia });
      
      expect(typeof blueResult).toBe('string');
      expect(typeof redResult).toBe('string');
      expect(blueResult).toMatch(/^#[0-9A-F]{6}$/);
      expect(redResult).toMatch(/^#[0-9A-F]{6}$/);
      
      // Blue should be significantly changed in tritanopia
      expect(blueResult).not.toBe('#0000FF');
    });

    test('achromatopsia should result in grayscale', () => {
      const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
      
      testColors.forEach(color => {
        const result = simulate(color, { type: ColorBlindnessType.Achromatopsia });
        expect(result).toMatch(/^#[0-9A-F]{6}$/);
        expect(isGrayscale(result)).toBe(true);
      });
    });
  });

  describe('Anomalous vs Complete Color Blindness', () => {
    test('anomalous conditions should be different from complete', () => {
      const testColor = '#FF0000';
      
      const protanopiaResult = simulate(testColor, { type: ColorBlindnessType.Protanopia });
      const protanomalyResult = simulate(testColor, { type: ColorBlindnessType.Protanomaly, anomalize: true });
      
      expect(protanopiaResult).toMatch(/^#[0-9A-F]{6}$/);
      expect(protanomalyResult).toMatch(/^#[0-9A-F]{6}$/);
      
      // Anomalous and complete conditions should produce different results
      expect(protanopiaResult).not.toBe(protanomalyResult);
    });
  });

  describe('Function Exports', () => {
    const testColor = '#FF0000';

    test('simulate function should return hex string', () => {
      const result = simulate(testColor, { type: ColorBlindnessType.Protanopia });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('protanopia function should return hex string', () => {
      const result = protanopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('protanomaly function should return hex string', () => {
      const result = protanomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('deuteranopia function should return hex string', () => {
      const result = deuteranopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('deuteranomaly function should return hex string', () => {
      const result = deuteranomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('tritanopia function should return hex string', () => {
      const result = tritanopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('tritanomaly function should return hex string', () => {
      const result = tritanomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('achromatopsia function should return hex string', () => {
      const result = achromatopsia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('achromatomaly function should return hex string', () => {
      const result = achromatomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle extreme RGB values', () => {
      const extremeColors = [
        { R: 0, G: 0, B: 0 },     // Black
        { R: 255, G: 255, B: 255 }, // White
        { R: 255, G: 0, B: 0 },   // Pure red
        { R: 0, G: 255, B: 0 },   // Pure green
        { R: 0, G: 0, B: 255 },   // Pure blue
      ];

      extremeColors.forEach(color => {
        Object.values(ColorBlindnessType).forEach(type => {
          const result = simulate(color, { type });
          expect(result).toMatch(/^#[0-9A-F]{6}$/);
        });
      });
    });

    test('should be deterministic', () => {
      const testColor = '#FF6600';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result1 = simulate(testColor, { type });
        const result2 = simulate(testColor, { type });
        
        expect(result1).toEqual(result2);
      });
    });
  });

  describe('Performance', () => {
    test('should process colors quickly', () => {
      const start = performance.now();
      
      // Process 100 colors
      for (let i = 0; i < 100; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        protanopia(randomColor);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should process 100 colors in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
}); 