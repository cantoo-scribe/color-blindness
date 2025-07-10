/**
 * @cantoo/color-blindness - A TypeScript library for color blindness simulation
 * 
 * Based on the scientific work:
 * "Computerized simulation of color appearance for dichromats"
 * Hans Brettel, Françoise Viénot, and John D. Mollon
 * Journal of the Optical Society of America A, Vol. 14, No. 10, pp. 2647-2655 (October 1997)
 * DOI: 10.1364/JOSAA.14.002647
 */

export * from './color-blindness-simulator';
export type * from './types';

// Explicit default export for better TypeScript support
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
} from './color-blindness-simulator';

const colorBlindness = {
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
} as const;

export default colorBlindness;
