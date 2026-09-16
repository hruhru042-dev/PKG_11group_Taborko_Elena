import * as Model from './colorMath.js';
export class ColorViewModel {
    constructor() {
        this.rgb = { r: 255, g: 0, b: 0 };
        this.illuminant = 'D65';
        this.strategy = 'clipping';
        this.listeners = [];
    }
    subscribe(listener) {
        this.listeners.push(listener);
    }
    notify() {
        this.listeners.forEach(cb => cb());
    }
    setRGB(r, g, b) {
        this.rgb = { r, g, b };
        this.notify();
    }
    setHSV(h, s, v) {
        this.rgb = Model.hsvToRgb(h, s, v);
        this.notify();
    }
    setXYZ(x, y, z) {
        const res = Model.xyzToRgb(x, y, z, this.illuminant, this.strategy);
        this.rgb = { r: res.r, g: res.g, b: res.b };
        this.notify();
    }
    getCalculatedValues() {
        const hsv = Model.rgbToHsv(this.rgb.r, this.rgb.g, this.rgb.b);
        const xyz = Model.rgbToXyz(this.rgb.r, this.rgb.g, this.rgb.b, this.illuminant);
        const rgbCheck = Model.xyzToRgb(xyz.x, xyz.y, xyz.z, this.illuminant, this.strategy);

        return {
            rgb: this.rgb,
            hsv,
            xyz: { x: +xyz.x.toFixed(2), y: +xyz.y.toFixed(2), z: +xyz.z.toFixed(2) },
            isOutOfRange: rgbCheck.isOutOfRange
        };
    }
}