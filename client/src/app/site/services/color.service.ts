import { Injectable } from '@angular/core';
import * as tinycolor from 'tinycolor2';

import { HtmlColor } from '../../domain/definitions/key-types';

export interface ColorDefinition {
    name: string;
    hex: string;
    darkContrast: boolean;
}

export class Color {
    public get red(): string {
        return parseInt(this._value.substr(0, 2), 16).toString();
    }

    public get green(): string {
        return parseInt(this._value.substr(2, 2), 16).toString();
    }

    public get blue(): string {
        return parseInt(this._value.substr(4, 2), 16).toString();
    }

    public get value(): HtmlColor {
        return `#${this._value}`;
    }

    private _value: string;

    public constructor(color: string | HtmlColor) {
        this._value = color.startsWith(`#`) ? color.slice(1) : color;
    }
}

@Injectable({
    providedIn: `root`
})
export class ColorService {
    public parseHtmlColorToColor(htmlColor: string | HtmlColor): Color {
        return new Color(htmlColor);
    }

    public getRandomHtmlColor(): HtmlColor {
        const singleValue = (): string => {
            const nextValue = Math.round(Math.random() * 255).toString(16);
            return nextValue.length === 2 ? nextValue : `0${nextValue}`;
        };
        const nextColor = [1, 1, 1].reduce(prevValue => prevValue + singleValue(), ``);
        return `#${nextColor}`;
    }

    public generateColorPaletteByHex(colorHex: string): ColorDefinition[] {
        const baseLight = tinycolor(`#ffffff`);
        const baseDark = this.multiplyColors(tinycolor(colorHex).toRgb(), tinycolor(colorHex).toRgb());
        return [
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 12), `50`),
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 30), `100`),
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 50), `200`),
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 70), `300`),
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 85), `400`),
            this.createColorObject(tinycolor.mix(baseLight, colorHex, 100), `500`),
            this.createColorObject(tinycolor.mix(baseDark, colorHex, 87), `600`),
            this.createColorObject(tinycolor.mix(baseDark, colorHex, 70), `700`),
            this.createColorObject(tinycolor.mix(baseDark, colorHex, 54), `800`),
            this.createColorObject(tinycolor.mix(baseDark, colorHex, 25), `900`),
            this.createColorObject(
                tinycolor
                    .mix(baseDark, undefined as any, 15)
                    .saturate(80)
                    .lighten(65),
                `A100`
            ),
            this.createColorObject(
                tinycolor
                    .mix(baseDark, undefined as any, 15)
                    .saturate(80)
                    .lighten(55),
                `A200`
            ),
            this.createColorObject(
                tinycolor
                    .mix(baseDark, undefined as any, 15)
                    .saturate(100)
                    .lighten(45),
                `A400`
            ),
            this.createColorObject(
                tinycolor
                    .mix(baseDark, undefined as any, 15)
                    .saturate(100)
                    .lighten(40),
                `A700`
            )
        ];
    }

    public createColorObject(colorHexRepresentation: tinycolor.Instance | string, name: string): ColorDefinition {
        const color = tinycolor(colorHexRepresentation);
        return {
            name,
            hex: color.toHexString(),
            darkContrast: color.isLight()
        };
    }

    private multiplyColors(rgbA: tinycolor.ColorFormats.RGBA, rgbB: tinycolor.ColorFormats.RGBA): tinycolor.Instance {
        rgbA.b = Math.floor((rgbA.b * rgbB.b) / 255);
        rgbA.g = Math.floor((rgbA.g * rgbB.g) / 255);
        rgbA.r = Math.floor((rgbA.r * rgbB.r) / 255);
        return tinycolor(`rgb ` + rgbA.r + ` ` + rgbA.g + ` ` + rgbA.b);
    }

    public isLightFromHex(hex: HtmlColor): boolean {
        const color = tinycolor(hex);
        return color.isLight();
    }
}
