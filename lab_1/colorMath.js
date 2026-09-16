export const ILLUMINANTS = {
    D65: { X: 95.047, Y: 100.0, Z: 108.883 },
    D50: { X: 96.421, Y: 100.0, Z: 82.518 },
    E: { X: 100.0, Y: 100.0, Z: 100.0 }
};
export function getRGBtoXYZMatrix(illuminantKey = 'D65') {
    if (illuminantKey === 'D65') {
        return [
            [0.412453, 0.357580, 0.180423],
            [0.212671, 0.715160, 0.072169],
            [0.019334, 0.119193, 0.950227]
        ];
    }
    const white = ILLUMINANTS[illuminantKey];
    const scaleX = white.X / 95.047;
    const scaleZ = white.Z / 108.883;
    return [
        [0.412453 * scaleX, 0.357580 * scaleX, 0.180423 * scaleX],
        [0.212671, 0.715160, 0.072169],
        [0.019334 * scaleZ, 0.119193 * scaleZ, 0.950227 * scaleZ]
    ];
}
export function invertMatrix3x3(m) {
    const det = m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const invdet = 1 / det;
    return [
        [(m[1][1] * m[2][2] - m[2][1] * m[1][2]) * invdet, (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invdet, (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invdet],
        [(m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invdet, (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invdet, (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invdet],
        [(m[1][0] * m[2][1] - m[1][1] * m[2][0]) * invdet, (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invdet, (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invdet]
    ];
}
export function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}
export function hsvToRgb(h, s, v) {
    h /= 360; s /= 100; v /= 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
export function rgbToXyz(r, g, b, illuminant = 'D65') {
    const f = (val) => {
        val /= 255;
        return val > 0.04045 ? Math.pow((val + 0.055) / 1.055, 2.4) * 100 : (val / 12.92) * 100;
    };
    const rn = f(r), gn = f(g), bn = f(b);
    const M = getRGBtoXYZMatrix(illuminant);
    return {
        x: M[0][0] * rn + M[0][1] * gn + M[0][2] * bn,
        y: M[1][0] * rn + M[1][1] * gn + M[1][2] * bn,
        z: M[2][0] * rn + M[2][1] * gn + M[2][2] * bn
    };
}
export function xyzToRgb(x, y, z, illuminant = 'D65', outOfRangeStrategy = 'clipping') {
    const M = getRGBtoXYZMatrix(illuminant);
    const invM = invertMatrix3x3(M);
    let rn = invM[0][0] * x + invM[0][1] * y + invM[0][2] * z;
    let gn = invM[1][0] * x + invM[1][1] * y + invM[1][2] * z;
    let bn = invM[2][0] * x + invM[2][1] * y + invM[2][2] * z;
    const invF = (val) => {
        val /= 100;
        return val >= 0.0031308 ? 1.055 * Math.pow(val, 1 / 2.4) - 0.055 : 12.92 * val;
    };
    let r = invF(rn) * 255;
    let g = invF(gn) * 255;
    let b = invF(bn) * 255;
    let isOutOfRange = (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255);
    if (outOfRangeStrategy === 'clipping') {
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
    } else if (outOfRangeStrategy === 'scaling') {
        const minVal = Math.min(r, g, b, 0);
        const maxVal = Math.max(r, g, b, 255);
        if (maxVal > minVal) {
            r = ((r - minVal) / (maxVal - minVal)) * 255;
            g = ((g - minVal) / (maxVal - minVal)) * 255;
            b = ((b - minVal) / (maxVal - minVal)) * 255;
        }
    }
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), isOutOfRange };
}