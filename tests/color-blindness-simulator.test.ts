/**
 * Tests for Color Blindness Simulator
 * 
 * Tests the Brettel-Viénot-Mollon algorithm implementation
 */

import { ColorBlindnessSimulator, ColorBlindnessType } from '../src/color-blindness-simulator';
import type { RGBColor, SimulationResult } from '../src/types';

describe('ColorBlindnessSimulator', () => {
  
  // Helper function to check if RGB values are valid
  const isValidRGB = (rgb: RGBColor): boolean => {
    return rgb.R >= 0 && rgb.R <= 255 &&
           rgb.G >= 0 && rgb.G <= 255 &&
           rgb.B >= 0 && rgb.B <= 255 &&
           Number.isInteger(rgb.R) &&
           Number.isInteger(rgb.G) &&
           Number.isInteger(rgb.B);
  };



  // Helper function to check if two RGB colors are approximately equal
  const approximatelyEqual = (rgb1: RGBColor, rgb2: RGBColor, tolerance = 1): boolean => {
    return Math.abs(rgb1.R - rgb2.R) <= tolerance &&
           Math.abs(rgb1.G - rgb2.G) <= tolerance &&
           Math.abs(rgb1.B - rgb2.B) <= tolerance;
  };

  describe('Input Format Handling', () => {
    test('should handle hex string input', () => {
      const result = ColorBlindnessSimulator.protanopia('#FF0000');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle RGB object input', () => {
      const result = ColorBlindnessSimulator.protanopia({ R: 255, G: 0, B: 0 });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle RGB array input', () => {
      const result = ColorBlindnessSimulator.protanopia([255, 0, 0]);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('should handle lowercase hex input', () => {
      const result = ColorBlindnessSimulator.protanopia('#ff0000');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid hex format', () => {
      expect(() => {
        ColorBlindnessSimulator.protanopia('#GGG');
      }).toThrow();
    });

    test('should throw error for short hex string', () => {
      expect(() => {
        ColorBlindnessSimulator.protanopia('#FF');
      }).toThrow();
    });

    test('should throw error for invalid RGB array length', () => {
      expect(() => {
        ColorBlindnessSimulator.protanopia([255, 0] as any);
      }).toThrow();
    });

    test('should throw error for empty string', () => {
      expect(() => {
        ColorBlindnessSimulator.protanopia('');
      }).toThrow();
    });
  });

  describe('Result Structure', () => {
    let result: SimulationResult;

    beforeEach(() => {
      result = ColorBlindnessSimulator.simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
    });

    test('should return correct result structure', () => {
      expect(result).toHaveProperty('original');
      expect(result).toHaveProperty('simulated');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('anomalized');
    });

    test('should have valid RGB values in result', () => {
      expect(isValidRGB(result.original)).toBe(true);
      expect(isValidRGB(result.simulated)).toBe(true);
    });

    test('should preserve original color', () => {
      expect(result.original).toEqual({ R: 255, G: 0, B: 0 });
    });

    test('should set correct color blindness type', () => {
      expect(result.type).toBe(ColorBlindnessType.Protanopia);
    });

    test('should set anomalized flag correctly', () => {
      const protanopiaResult = ColorBlindnessSimulator.simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
      const protanomalyResult = ColorBlindnessSimulator.simulate('#FF0000', { type: ColorBlindnessType.Protanomaly, anomalize: true });
      
      expect(protanopiaResult.anomalized).toBe(false);
      expect(protanomalyResult.anomalized).toBe(true);
    });
  });

  describe('Color Preservation Properties', () => {
    test('should process gray colors correctly', () => {
      const gray = '#808080';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = ColorBlindnessSimulator.simulate(gray, { type });
        
        // Should return valid RGB values
        expect(isValidRGB(result.simulated)).toBe(true);
        
        // For achromatopsia/achromatomaly, should be perfect gray
        if (type === 'achromatopsia' || type === 'achromatomaly') {
          expect(result.simulated.R).toBe(result.simulated.G);
          expect(result.simulated.G).toBe(result.simulated.B);
        }
        // For other types, we just verify that the algorithm processes the color
        // (the exact output depends on the specific algorithm implementation)
      });
    });

    test('should preserve black color', () => {
      const black = '#000000';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = ColorBlindnessSimulator.simulate(black, { type });
        expect(approximatelyEqual(result.simulated, { R: 0, G: 0, B: 0 }, 2)).toBe(true);
      });
    });

    test('should preserve white color', () => {
      const white = '#FFFFFF';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result = ColorBlindnessSimulator.simulate(white, { type });
        expect(approximatelyEqual(result.simulated, { R: 255, G: 255, B: 255 }, 2)).toBe(true);
      });
    });
  });

  describe('Specific Color Blindness Types', () => {
    const testColors = [
      { name: 'Red', hex: '#FF0000', rgb: { R: 255, G: 0, B: 0 } },
      { name: 'Green', hex: '#00FF00', rgb: { R: 0, G: 255, B: 0 } },
      { name: 'Blue', hex: '#0000FF', rgb: { R: 0, G: 0, B: 255 } },
      { name: 'Yellow', hex: '#FFFF00', rgb: { R: 255, G: 255, B: 0 } },
    ];

    test('protanopia should affect red perception', () => {
      const redResult = ColorBlindnessSimulator.simulate('#FF0000', { type: ColorBlindnessType.Protanopia });
      const greenResult = ColorBlindnessSimulator.simulate('#00FF00', { type: ColorBlindnessType.Protanopia });
      
      // Red should be significantly changed in protanopia
      expect(approximatelyEqual(redResult.simulated, redResult.original, 50)).toBe(false);
      
      // Result should have valid RGB values
      expect(isValidRGB(redResult.simulated)).toBe(true);
      expect(isValidRGB(greenResult.simulated)).toBe(true);
    });

    test('deuteranopia should affect green perception', () => {
      const greenResult = ColorBlindnessSimulator.simulate('#00FF00', { type: ColorBlindnessType.Deuteranopia });
      const blueResult = ColorBlindnessSimulator.simulate('#0000FF', { type: ColorBlindnessType.Deuteranopia });
      
      // Green should be significantly changed in deuteranopia
      expect(approximatelyEqual(greenResult.simulated, greenResult.original, 50)).toBe(false);
      
      // Result should have valid RGB values
      expect(isValidRGB(greenResult.simulated)).toBe(true);
      expect(isValidRGB(blueResult.simulated)).toBe(true);
    });

    test('tritanopia should affect blue perception', () => {
      const blueResult = ColorBlindnessSimulator.simulate('#0000FF', { type: ColorBlindnessType.Tritanopia });
      const redResult = ColorBlindnessSimulator.simulate('#FF0000', { type: ColorBlindnessType.Tritanopia });
      
      // Blue should be significantly changed in tritanopia
      expect(approximatelyEqual(blueResult.simulated, blueResult.original, 50)).toBe(false);
      
      // Result should have valid RGB values
      expect(isValidRGB(blueResult.simulated)).toBe(true);
      expect(isValidRGB(redResult.simulated)).toBe(true);
    });

    test('achromatopsia should result in grayscale', () => {
      testColors.forEach(color => {
        const result = ColorBlindnessSimulator.simulate(color.hex, { type: ColorBlindnessType.Achromatopsia });
        const { R, G, B } = result.simulated;
        
        // Should be grayscale (R = G = B)
        expect(R).toBe(G);
        expect(G).toBe(B);
        expect(isValidRGB(result.simulated)).toBe(true);
      });
    });
  });

  describe('Anomalous vs Complete Color Blindness', () => {
    test('anomalous conditions should be less severe than complete', () => {
      const testColor = '#FF0000';
      
      const protanopia = ColorBlindnessSimulator.simulate(testColor, { type: ColorBlindnessType.Protanopia });
      const protanomaly = ColorBlindnessSimulator.simulate(testColor, { type: ColorBlindnessType.Protanomaly, anomalize: true });
      
      // Anomalous condition should be closer to original than complete condition
      const originalColor = { R: 255, G: 0, B: 0 };
      
      const protanopiaDistance = Math.sqrt(
        Math.pow(protanopia.simulated.R - originalColor.R, 2) +
        Math.pow(protanopia.simulated.G - originalColor.G, 2) +
        Math.pow(protanopia.simulated.B - originalColor.B, 2)
      );
      
      const protanomalyDistance = Math.sqrt(
        Math.pow(protanomaly.simulated.R - originalColor.R, 2) +
        Math.pow(protanomaly.simulated.G - originalColor.G, 2) +
        Math.pow(protanomaly.simulated.B - originalColor.B, 2)
      );
      
      // Anomaly should be closer to original (smaller distance)
      expect(protanomalyDistance).toBeLessThan(protanopiaDistance);
    });
  });

  describe('Static Methods', () => {
    const testColor = '#FF0000';

    test('simulateHex method should return hex string', () => {
      const result = ColorBlindnessSimulator.simulateHex(testColor, { type: ColorBlindnessType.Protanopia });
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('protanopia method should return hex string', () => {
      const result = ColorBlindnessSimulator.protanopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('protanomaly method should return hex string', () => {
      const result = ColorBlindnessSimulator.protanomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('deuteranopia method should return hex string', () => {
      const result = ColorBlindnessSimulator.deuteranopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('deuteranomaly method should return hex string', () => {
      const result = ColorBlindnessSimulator.deuteranomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('tritanopia method should return hex string', () => {
      const result = ColorBlindnessSimulator.tritanopia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('tritanomaly method should return hex string', () => {
      const result = ColorBlindnessSimulator.tritanomaly(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('achromatopsia method should return hex string', () => {
      const result = ColorBlindnessSimulator.achromatopsia(testColor);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^#[0-9A-F]{6}$/);
    });

    test('achromatomaly method should return hex string', () => {
      const result = ColorBlindnessSimulator.achromatomaly(testColor);
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
          const result = ColorBlindnessSimulator.simulate(color, { type });
          expect(isValidRGB(result.simulated)).toBe(true);
        });
      });
    });

    test('should be deterministic', () => {
      const testColor = '#FF6600';
      
      Object.values(ColorBlindnessType).forEach(type => {
        const result1 = ColorBlindnessSimulator.simulate(testColor, { type });
        const result2 = ColorBlindnessSimulator.simulate(testColor, { type });
        
        expect(result1.simulated).toEqual(result2.simulated);
      });
    });
  });

  describe('Performance', () => {
    test('should process colors quickly', () => {
      const start = performance.now();
      
      // Process 100 colors
      for (let i = 0; i < 100; i++) {
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
        ColorBlindnessSimulator.protanopia(randomColor);
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should process 100 colors in less than 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
}); 