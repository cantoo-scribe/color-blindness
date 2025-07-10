/**
 * Type definitions for color blindness simulation
 * 
 * Based on the scientific work:
 * "Computerized simulation of color appearance for dichromats"
 * Hans Brettel, Françoise Viénot, and John D. Mollon
 * Journal of the Optical Society of America A, Vol. 14, No. 10, pp. 2647-2655 (October 1997)
 */

/**
 * RGB color representation with values from 0 to 255
 */
export interface RGBColor {
  R: number;
  G: number;
  B: number;
}

/**
 * XYZ color space representation
 */
export interface XYZColor {
  X: number;
  Y: number;
  Z: number;
}

/**
 * Chromaticity coordinates in CIE xyY color space
 */
export interface ChromaticityCoordinates {
  x: number;
  y: number;
  Y: number;
}

/**
 * Types of color blindness supported by the simulator
 */
export enum ColorBlindnessType {
  Protanopia = 'protanopia',
  Protanomaly = 'protanomaly',
  Deuteranopia = 'deuteranopia',
  Deuteranomaly = 'deuteranomaly',
  Tritanopia = 'tritanopia',
  Tritanomaly = 'tritanomaly',
  Achromatopsia = 'achromatopsia',
  Achromatomaly = 'achromatomaly'
}

/**
 * Configuration for color blindness simulation including confusion points and color axis
 */
export interface BlindnessConfiguration {
  /** Confusion point x-coordinate */
  x: number;
  /** Confusion point y-coordinate */
  y: number;
  /** Slope of the color axis */
  m: number;
  /** Y-intercept of the color axis */
  yi: number;
}

/**
 * Options for color simulation
 */
export interface SimulationOptions {
  /** Type of color blindness to simulate */
  type: ColorBlindnessType;
  /** Whether to apply anomalous trichromacy (partial color blindness) */
  anomalize?: boolean;
  /** Color profile to use (default: 'sRGB') */
  colorProfile?: 'sRGB' | 'generic';
  /** Gamma correction value (default: 2.2) */
  gammaCorrection?: number;
}

/**
 * Color input formats supported by the simulator
 */
export type ColorInput = string | RGBColor | [number, number, number];
