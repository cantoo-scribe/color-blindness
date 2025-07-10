# @cantoo/color-blindness

A TypeScript library for accurate color blindness simulation using the Brettel-Viénot-Mollon algorithm.

[![npm version](https://badge.fury.io/js/@cantoo%2Fcolor-blindness.svg)](https://badge.fury.io/js/@cantoo%2Fcolor-blindness)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This library provides scientifically accurate simulation of how colors appear to individuals with different types of color vision deficiency (color blindness). The implementation is based on the research by **Hans Brettel, Françoise Viénot, and John D. Mollon** published in the *Journal of the Optical Society of America A* (1997).

## Scientific Foundation

**Reference:** "Computerized simulation of color appearance for dichromats"  
**Authors:** Hans Brettel, Françoise Viénot, and John D. Mollon  
**Journal:** Journal of the Optical Society of America A, Vol. 14, No. 10, pp. 2647-2655 (October 1997)  
**DOI:** [10.1364/JOSAA.14.002647](https://doi.org/10.1364/JOSAA.14.002647)

The algorithm uses confusion lines in the CIE chromaticity diagram to accurately simulate color perception for different types of dichromacy and anomalous trichromacy.

## Installation

```bash
npm install @cantoo/color-blindness
```

## Quick Start

```typescript
import { ColorBlindnessSimulator, ColorBlindnessType } from '@cantoo/color-blindness';

// Simple API - Returns hex color directly
const protanopiaColor = ColorBlindnessSimulator.protanopia('#FF0000');
console.log(protanopiaColor); // '#9C9C00'

// Works with different input formats
const deuteranopia1 = ColorBlindnessSimulator.deuteranopia('#FF0000');     // Hex string
const deuteranopia2 = ColorBlindnessSimulator.deuteranopia([255, 0, 0]);   // RGB array
const deuteranopia3 = ColorBlindnessSimulator.deuteranopia({ R: 255, G: 0, B: 0 }); // RGB object

// Advanced API - Returns detailed result object
const detailedResult = ColorBlindnessSimulator.simulate('#FF0000', {
  type: ColorBlindnessType.Deuteranomaly,
  anomalize: true
});
console.log(detailedResult);
// {
//   original: { R: 255, G: 0, B: 0 },
//   simulated: { R: 201, G: 123, B: 0 },
//   type: 'deuteranomaly',
//   anomalized: true
// }
```

## Supported Color Vision Deficiencies

| Type | Description | Method |
|------|-------------|---------|
| **Protanopia** | Complete absence of red photoreceptors | `protanopia()` |
| **Protanomaly** | Reduced sensitivity to red | `protanomaly()` |
| **Deuteranopia** | Complete absence of green photoreceptors | `deuteranopia()` |
| **Deuteranomaly** | Reduced sensitivity to green | `deuteranomaly()` |
| **Tritanopia** | Complete absence of blue photoreceptors | `tritanopia()` |
| **Tritanomaly** | Reduced sensitivity to blue | `tritanomaly()` |
| **Achromatopsia** | Complete color blindness (monochromacy) | `achromatopsia()` |
| **Achromatomaly** | Reduced color sensitivity | `achromatomaly()` |

## Usage Examples

### Simple API (Recommended)

```typescript
import { ColorBlindnessSimulator } from '@cantoo/color-blindness';

// Returns hex colors directly - perfect for most use cases
const protanopia = ColorBlindnessSimulator.protanopia('#FF6B35');      // '#A86B00'
const deuteranopia = ColorBlindnessSimulator.deuteranopia('#FF6B35');  // '#C4B835'
const tritanopia = ColorBlindnessSimulator.tritanopia('#FF6B35');      // '#FF6B56'

// Works with all input formats
const fromHex = ColorBlindnessSimulator.protanopia('#FF6B35');
const fromRGB = ColorBlindnessSimulator.protanopia({ R: 255, G: 107, B: 53 });
const fromArray = ColorBlindnessSimulator.protanopia([255, 107, 53]);
```

### Intermediate API

```typescript
import { ColorBlindnessSimulator, ColorBlindnessType } from '@cantoo/color-blindness';

// Custom options with hex output
const customHex = ColorBlindnessSimulator.simulateHex('#FF6B35', {
  type: ColorBlindnessType.Protanomaly,
  anomalize: true,
  colorProfile: 'sRGB',
  gammaCorrection: 2.2
});
console.log(customHex); // '#D4823A'
```

### Advanced API (Full Control)

```typescript
import { ColorBlindnessSimulator, ColorBlindnessType } from '@cantoo/color-blindness';

// Detailed result object for analysis
const result = ColorBlindnessSimulator.simulate('#FF6B35', {
  type: ColorBlindnessType.Protanomaly,
  anomalize: true,
  colorProfile: 'sRGB',
  gammaCorrection: 2.2
});

console.log(result.original);   // { R: 255, G: 107, B: 53 }
console.log(result.simulated);  // { R: 212, G: 130, B: 58 }
console.log(result.type);       // 'protanomaly'
console.log(result.anomalized); // true
```

### Batch Processing

```typescript
const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

// Simple batch processing with hex output
const protanopiaColors = colors.map(color => 
  ColorBlindnessSimulator.protanopia(color)
);
console.log(protanopiaColors); // ['#9C9C00', '#9C9C00', '#0000FF', '#9C9C00']

// Advanced batch processing with full details
const colorBlindnessTypes = [
  ColorBlindnessType.Protanopia,
  ColorBlindnessType.Deuteranopia,
  ColorBlindnessType.Tritanopia
];

const detailedResults = colors.map(color => 
  colorBlindnessTypes.map(type => 
    ColorBlindnessSimulator.simulate(color, { type })
  )
);
```

## API Reference

### ColorBlindnessSimulator

#### Static Methods

##### Simple API (Returns hex strings)
- `protanopia(input: ColorInput): string`
- `protanomaly(input: ColorInput): string`
- `deuteranopia(input: ColorInput): string`
- `deuteranomaly(input: ColorInput): string`
- `tritanopia(input: ColorInput): string`
- `tritanomaly(input: ColorInput): string`
- `achromatopsia(input: ColorInput): string`
- `achromatomaly(input: ColorInput): string`

##### Intermediate API
- `simulateHex(input: ColorInput, options: SimulationOptions): string`

##### Advanced API (Returns detailed objects)
- `simulate(input: ColorInput, options: SimulationOptions): SimulationResult`

### Types

#### ColorInput
```typescript
type ColorInput = string | RGBColor | [number, number, number];
```

#### RGBColor
```typescript
interface RGBColor {
  R: number; // 0-255
  G: number; // 0-255
  B: number; // 0-255
}
```

#### SimulationOptions
```typescript
interface SimulationOptions {
  type: ColorBlindnessType;
  anomalize?: boolean;           // Default: false
  colorProfile?: 'sRGB' | 'generic'; // Default: 'sRGB'
  gammaCorrection?: number;      // Default: 2.2
}
```

#### SimulationResult
```typescript
interface SimulationResult {
  original: RGBColor;
  simulated: RGBColor;
  type: ColorBlindnessType;
  anomalized: boolean;
}
```

## Algorithm Details

### Color Space Conversions

The library performs precise color space conversions:
1. **RGB → XYZ** with gamma correction
2. **XYZ → xyY** chromaticity coordinates
3. **Confusion line calculation** using the Brettel-Viénot-Mollon algorithm
4. **Gamut mapping** to ensure valid RGB output
5. **XYZ → RGB** with inverse gamma correction

### Gamma Correction

- **sRGB Profile**: Uses the standard sRGB gamma correction curve
- **Generic Profile**: Uses simple power law gamma correction (γ = 2.2 by default)

### Gamut Mapping

The algorithm ensures that simulated colors remain within the displayable RGB gamut by:
1. Converting simulated colors to linear RGB
2. Calculating the direction toward neutral gray (D65 white point)
3. Applying proportional adjustment to bring out-of-gamut colors back into range

## Development

### Setup

```bash
git clone <repository-url>
cd color-blindness
npm install
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Auto-fix ESLint errors
- `npm test` - Run Jest test suite
- `npm run release` - Create a new release with release-it

### Pre-publication Checks

Before each publication, the project automatically:
1. ✅ Runs ESLint (code quality)
2. ✅ Compiles TypeScript (build verification)
3. ✅ Generates type definitions

### Publishing

To publish a new version:

```bash
npm run release
```

This will automatically:
- Run linting and build
- Increment version number
- Create git tag
- Publish to npm
- Create GitHub release

## Browser Compatibility

The library works in all modern browsers and Node.js environments that support:
- ES2020 features
- TypeScript (for development)

## Performance

The simulation algorithms are optimized for real-time use:
- ⚡ Fast matrix operations
- 🎯 Efficient color space conversions
- 📐 Minimal computational overhead

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Hans Brettel, Françoise Viénot, and John D. Mollon** for their groundbreaking research on color vision simulation
- The color science community for continued research in accessible color design
- All contributors to this open-source project

## Related Projects

- [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) - Online color blindness simulator
- [Colorbrewer](https://colorbrewer2.org/) - Color schemes for maps and charts
- [Accessible Colors](https://accessible-colors.com/) - Color accessibility tools

---

**Made with ❤️ for accessible design** 