/**
 * Color blindness simulation using the Brettel-Viénot-Mollon algorithm
 * 
 * Implementation based on the scientific work:
 * "Computerized simulation of color appearance for dichromats"
 * Hans Brettel, Françoise Viénot, and John D. Mollon
 * Journal of the Optical Society of America A, Vol. 14, No. 10, pp. 2647-2655 (October 1997)
 * DOI: 10.1364/JOSAA.14.002647
 * 
 * This algorithm uses confusion lines in the CIE chromaticity diagram to simulate
 * how colors appear to individuals with different types of color vision deficiency.
 */

import {
  RGBColor,
  XYZColor,
  ChromaticityCoordinates,
  BlindnessConfiguration,
  SimulationOptions,
  ColorBlindnessType,
  ColorInput,
} from './types';

// Re-export for convenience
export { ColorBlindnessType };

/**
 * Color transformation matrices for sRGB color space
 */
const COLOR_MATRICES = {
  /** Transform XYZ to RGB */
  XYZ_TO_RGB: [
    3.240712470389558, -0.969259258688888, 0.05563600315398933,
    -1.5372626602963142, 1.875996969313966, -0.2039948802843549,
    -0.49857440415943116, 0.041556132211625726, 1.0570636917433989,
  ],
  /** Transform RGB to XYZ */
  RGB_TO_XYZ: [
    0.41242371206635076, 0.21265606784927693, 0.019331987577444885,
    0.3575793401363035, 0.715157818248362, 0.11919267420354762,
    0.1804662232369621, 0.0721864539171564, 0.9504491124870351,
  ],
} as const;

/**
 * Configuration for different types of color blindness
 * Based on the confusion points and color axes from Brettel et al. (1997)
 * 
 * Note: Each configuration represents a confusion axis shared by both 
 * dichromatic (-opia) and anomalous trichromatic (-omaly) conditions
 */
const BLINDNESS_CONFIGURATIONS: Record<string, BlindnessConfiguration> = {
  protan: {
    x: 0.7465,    // Confusion point x-coordinate for protanopia/protanomaly
    y: 0.2535,    // Confusion point y-coordinate
    m: 1.273463,  // Slope of color axis
    yi: -0.073894, // Y-intercept of color axis
  },
  deutan: {
    x: 1.02274,   // Confusion point x-coordinate for deuteranopia/deuteranomaly
    y: -0.02274,  // Confusion point y-coordinate
    m: 0.968437,  // Slope of color axis
    yi: 0.003331, // Y-intercept of color axis
  },
  tritan: {
    x: 0.1748,    // Confusion point x-coordinate for tritanopia/tritanomaly
    y: 0,         // Confusion point y-coordinate
    m: 0.062921,  // Slope of color axis
    yi: 0.292119, // Y-intercept of color axis
  },
  custom: {
    x: 0.735,     // Custom confusion point x-coordinate
    y: 0.265,     // Custom confusion point y-coordinate
    m: -1.059259, // Custom slope of color axis
    yi: 1.026914, // Custom Y-intercept of color axis
  },
} as const;

/**
 * Default simulation options
 */
const DEFAULT_OPTIONS: Required<Pick<SimulationOptions, 'colorProfile' | 'gammaCorrection'>> = {
  colorProfile: 'sRGB',
  gammaCorrection: 2.2,
};

/**
 * Converts RGB color values (0-255) to XYZ color space
 * Applies gamma correction for sRGB or generic color profiles
 */
function convertRgbToXyz(rgb: RGBColor, options: Required<Pick<SimulationOptions, 'colorProfile' | 'gammaCorrection'>>): XYZColor {
  const matrix = COLOR_MATRICES.RGB_TO_XYZ;
  
  // Normalize RGB values to [0, 1]
  let r = rgb.R / 255;
  let g = rgb.G / 255;
  let b = rgb.B / 255;

  // Apply gamma correction
  if (options.colorProfile === 'sRGB') {
    // sRGB gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  } else {
    // Generic gamma correction
    r = Math.pow(r, options.gammaCorrection);
    g = Math.pow(g, options.gammaCorrection);
    b = Math.pow(b, options.gammaCorrection);
  }

  // Convert to XYZ using transformation matrix
  return {
    X: r * matrix[0] + g * matrix[3] + b * matrix[6],
    Y: r * matrix[1] + g * matrix[4] + b * matrix[7],
    Z: r * matrix[2] + g * matrix[5] + b * matrix[8],
  };
}

/**
 * Converts XYZ color to xyY chromaticity coordinates
 */
function convertXyzToXyy(xyz: XYZColor): ChromaticityCoordinates {
  const sum = xyz.X + xyz.Y + xyz.Z;
  
  if (sum === 0) {
    return { x: 0, y: 0, Y: xyz.Y };
  }
  
  return {
    x: xyz.X / sum,
    y: xyz.Y / sum,
    Y: xyz.Y,
  };
}

/**
 * Converts XYZ color back to RGB (0-255) with proper gamma correction
 */
function convertXyzToRgb(xyz: XYZColor, options: Required<Pick<SimulationOptions, 'colorProfile' | 'gammaCorrection'>>): RGBColor {
  const matrix = COLOR_MATRICES.XYZ_TO_RGB;
  
  // Convert XYZ to linear RGB
  let r = xyz.X * matrix[0] + xyz.Y * matrix[3] + xyz.Z * matrix[6];
  let g = xyz.X * matrix[1] + xyz.Y * matrix[4] + xyz.Z * matrix[7];
  let b = xyz.X * matrix[2] + xyz.Y * matrix[5] + xyz.Z * matrix[8];

  // Apply inverse gamma correction and clamp to [0, 1]
  if (options.colorProfile === 'sRGB') {
    r = r <= 0 ? 0 : r >= 1 ? 1 : (r <= 0.0031308 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055);
    g = g <= 0 ? 0 : g >= 1 ? 1 : (g <= 0.0031308 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055);
    b = b <= 0 ? 0 : b >= 1 ? 1 : (b <= 0.0031308 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055);
  } else {
    r = r <= 0 ? 0 : r >= 1 ? 1 : Math.pow(r, 1 / options.gammaCorrection);
    g = g <= 0 ? 0 : g >= 1 ? 1 : Math.pow(g, 1 / options.gammaCorrection);
    b = b <= 0 ? 0 : b >= 1 ? 1 : Math.pow(b, 1 / options.gammaCorrection);
  }

  // Convert to 0-255 range
  return {
    R: Math.round(r * 255),
    G: Math.round(g * 255),
    B: Math.round(b * 255),
  };
}

/**
 * Converts linear RGB values back to XYZ color space
 */
function convertLinearRgbToXyz(r: number, g: number, b: number): XYZColor {
  const matrix = COLOR_MATRICES.RGB_TO_XYZ;
  
  return {
    X: r * matrix[0] + g * matrix[3] + b * matrix[6],
    Y: r * matrix[1] + g * matrix[4] + b * matrix[7],
    Z: r * matrix[2] + g * matrix[5] + b * matrix[8],
  };
}

/**
 * Simulates achromatopsia (complete or partial color blindness)
 * Converts color to grayscale using luminance weights
 */
function simulateAchromatopsia(rgb: RGBColor, anomalize: boolean): RGBColor {
  // Calculate luminance using D65 standard illuminant weights for sRGB
  const luminance = rgb.R * 0.212656 + rgb.G * 0.715158 + rgb.B * 0.072186;
  const grayscale = { R: Math.round(luminance), G: Math.round(luminance), B: Math.round(luminance) };

  if (anomalize) {
    // For achromatomaly, blend with original color
    const blendFactor = 1.75;
    const totalWeight = blendFactor + 1;
    
    return {
      R: Math.round((blendFactor * grayscale.R + rgb.R) / totalWeight),
      G: Math.round((blendFactor * grayscale.G + rgb.G) / totalWeight),
      B: Math.round((blendFactor * grayscale.B + rgb.B) / totalWeight),
    };
  }

  return grayscale;
}

/**
 * Implements the Brettel-Viénot-Mollon algorithm for dichromat simulation
 * Uses confusion lines in chromaticity space to simulate color perception
 */
function simulateDichromacy(
  rgb: RGBColor,
  configuration: BlindnessConfiguration,
  options: Required<Pick<SimulationOptions, 'colorProfile' | 'gammaCorrection'>>
): RGBColor {
  // Convert RGB to XYZ then to chromaticity coordinates
  const xyz = convertRgbToXyz(rgb, options);
  const chromaticity = convertXyzToXyy(xyz);

  // Calculate confusion line from source color to confusion point
  const confusionSlope = (chromaticity.y - configuration.y) / (chromaticity.x - configuration.x);
  const confusionYIntercept = chromaticity.y - chromaticity.x * confusionSlope;

  // Find intersection with color axis (protanopic/deuteranopic/tritanopic axis)
  const intersectionX = (configuration.yi - confusionYIntercept) / (confusionSlope - configuration.m);
  const intersectionY = confusionSlope * intersectionX + confusionYIntercept;

  // Convert back to XYZ coordinates
  const simulatedXyz: XYZColor = {
    X: (intersectionX * chromaticity.Y) / intersectionY,
    Y: chromaticity.Y, // Luminance remains unchanged
    Z: ((1 - (intersectionX + intersectionY)) * chromaticity.Y) / intersectionY,
  };

  // Gamut mapping: ensure the result is within the RGB gamut
  const matrix = COLOR_MATRICES.XYZ_TO_RGB;
  
  // Convert to linear RGB to check gamut boundaries
  let linearR = simulatedXyz.X * matrix[0] + simulatedXyz.Y * matrix[3] + simulatedXyz.Z * matrix[6];
  let linearG = simulatedXyz.X * matrix[1] + simulatedXyz.Y * matrix[4] + simulatedXyz.Z * matrix[7];
  let linearB = simulatedXyz.X * matrix[2] + simulatedXyz.Y * matrix[5] + simulatedXyz.Z * matrix[8];

  // Calculate neutral gray point for gamut mapping (D65 white point)
  const neutralX = (0.312713 * chromaticity.Y) / 0.329016;
  const neutralZ = (0.358271 * chromaticity.Y) / 0.329016;
  
  // Calculate direction to neutral point
  const deltaX = neutralX - simulatedXyz.X;
  const deltaY = 0; // No change in Y dimension as per original algorithm
  const deltaZ = neutralZ - simulatedXyz.Z;
  
  // Convert deltas to RGB space
  const deltaR = deltaX * matrix[0] + deltaY * matrix[3] + deltaZ * matrix[6];
  const deltaG = deltaX * matrix[1] + deltaY * matrix[4] + deltaZ * matrix[7];
  const deltaB = deltaX * matrix[2] + deltaY * matrix[5] + deltaZ * matrix[8];

  // Calculate adjustment factors to bring into gamut (improved version with division by zero protection)
  const adjustR = deltaR !== 0 ? ((linearR < 0 ? 0 : 1) - linearR) / deltaR : 0;
  const adjustG = deltaG !== 0 ? ((linearG < 0 ? 0 : 1) - linearG) / deltaG : 0;
  const adjustB = deltaB !== 0 ? ((linearB < 0 ? 0 : 1) - linearB) / deltaB : 0;
  
  // Clamp adjustment factors
  const clampedAdjustR = adjustR > 1 || adjustR < 0 ? 0 : adjustR;
  const clampedAdjustG = adjustG > 1 || adjustG < 0 ? 0 : adjustG;
  const clampedAdjustB = adjustB > 1 || adjustB < 0 ? 0 : adjustB;
  
  // Use maximum adjustment to maintain color relationships
  const maxAdjust = Math.max(clampedAdjustR, clampedAdjustG, clampedAdjustB);

  // Apply gamut mapping
  linearR += maxAdjust * deltaR;
  linearG += maxAdjust * deltaG;
  linearB += maxAdjust * deltaB;

  // Proper colorimetric conversion: linear RGB → XYZ → RGB with gamma correction
  const finalXyz = convertLinearRgbToXyz(linearR, linearG, linearB);
  return convertXyzToRgb(finalXyz, options);
}

/**
 * Parses various color input formats to RGB
 */
function parseColorInput(input: ColorInput): RGBColor {
  if (typeof input === 'string') {
    // Parse hex color
    const hex = input.replace('#', '');
    if (hex.length !== 6) {
      throw new Error(`Invalid hex color format: ${input}`);
    }
    
    return {
      R: parseInt(hex.substr(0, 2), 16),
      G: parseInt(hex.substr(2, 2), 16),
      B: parseInt(hex.substr(4, 2), 16),
    };
  }
  
  if (Array.isArray(input)) {
    if (input.length !== 3) {
      throw new Error('RGB array must contain exactly 3 values');
    }
    
    return { R: input[0], G: input[1], B: input[2] };
  }
  
  return input;
}

/**
 * Converts RGB color to hex string
 */
function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.R)}${toHex(rgb.G)}${toHex(rgb.B)}`.toUpperCase();
}

/**
 * Simulates how a color appears to individuals with specific color vision deficiency
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function simulate(input: ColorInput, options: SimulationOptions): string {
  const rgb = parseColorInput(input);
  const fullOptions = { ...DEFAULT_OPTIONS, ...options };
  
  let simulated: RGBColor;
  
  // Handle achromatopsia separately
  if (options.type === ColorBlindnessType.Achromatopsia || options.type === ColorBlindnessType.Achromatomaly) {
    simulated = simulateAchromatopsia(rgb, options.anomalize || false);
  } else {
    // Get configuration for the specific type of color blindness
    // Both dichromatic (-opia) and anomalous (-omaly) conditions share the same confusion axis
    let configKey: keyof typeof BLINDNESS_CONFIGURATIONS;
    if (options.type.startsWith('protan')) {
      configKey = 'protan';  // protanopia & protanomaly
    } else if (options.type.startsWith('deutan')) {
      configKey = 'deutan';  // deuteranopia & deuteranomaly
    } else if (options.type.startsWith('tritan')) {
      configKey = 'tritan';  // tritanopia & tritanomaly
    } else {
      configKey = 'custom';  // fallback for experimental or custom configurations
    }
    
    const configuration = BLINDNESS_CONFIGURATIONS[configKey];
    
    if (!configuration) {
      throw new Error(`Unsupported color blindness type: ${options.type}`);
    }
    
    simulated = simulateDichromacy(rgb, configuration, fullOptions);
    
    // Apply anomalous trichromacy if requested
    if (options.anomalize) {
      const blendFactor = 1.75;
      const totalWeight = blendFactor + 1;
      
      simulated = {
        R: (blendFactor * simulated.R + rgb.R) / totalWeight,
        G: (blendFactor * simulated.G + rgb.G) / totalWeight,
        B: (blendFactor * simulated.B + rgb.B) / totalWeight,
      };
    }
  }
  
  // Ensure RGB values are valid
  simulated.R = Math.max(0, Math.min(255, simulated.R || 0));
  simulated.G = Math.max(0, Math.min(255, simulated.G || 0));
  simulated.B = Math.max(0, Math.min(255, simulated.B || 0));
  
  return rgbToHex(simulated);
}

/**
 * Simulates protanopia (red color blindness)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function protanopia(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Protanopia });
}

/**
 * Simulates protanomaly (reduced red sensitivity)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function protanomaly(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Protanomaly, anomalize: true });
}

/**
 * Simulates deuteranopia (green color blindness)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function deuteranopia(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Deuteranopia });
}

/**
 * Simulates deuteranomaly (reduced green sensitivity)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function deuteranomaly(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Deuteranomaly, anomalize: true });
}

/**
 * Simulates tritanopia (blue color blindness)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function tritanopia(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Tritanopia });
}

/**
 * Simulates tritanomaly (reduced blue sensitivity)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function tritanomaly(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Tritanomaly, anomalize: true });
}

/**
 * Simulates achromatopsia (complete color blindness)
 * @returns Hex color string (e.g., '#808080')
 */
export function achromatopsia(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Achromatopsia });
}

/**
 * Simulates achromatomaly (reduced color sensitivity)
 * @returns Hex color string (e.g., '#A1B2C3')
 */
export function achromatomaly(input: ColorInput): string {
  return simulate(input, { type: ColorBlindnessType.Achromatomaly, anomalize: true });
}
