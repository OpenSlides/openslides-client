import { Injectable } from '@angular/core';
import { RGBA, TinyColor } from '@ctrl/tinycolor';

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
        const singleValue = () => {
            const nextValue = Math.round(Math.random() * 255).toString(16);
            return nextValue.length === 2 ? nextValue : `0${nextValue}`;
        };
        const nextColor = [1, 1, 1].reduce(prevValue => prevValue + singleValue(), ``);
        return `#${nextColor}`;
    }

    public generateColorPaletteByHex(colorHex: string): ColorDefinition[] {
        const color = new TinyColor(colorHex);
        const baseLight = new TinyColor(`#ffffff`);
        const baseDark = this.multiplyColors(new TinyColor(colorHex).toRgb(), new TinyColor(colorHex).toRgb());
        return [
            this.createColorObject(baseLight.mix(color, 12), `50`),
            this.createColorObject(baseLight.mix(colorHex, 30), `100`),
            this.createColorObject(baseLight.mix(colorHex, 50), `200`),
            this.createColorObject(baseLight.mix(colorHex, 70), `300`),
            this.createColorObject(baseLight.mix(colorHex, 85), `400`),
            this.createColorObject(baseLight.mix(colorHex, 100), `500`),
            this.createColorObject(baseDark.mix(colorHex, 87), `600`),
            this.createColorObject(baseDark.mix(colorHex, 70), `700`),
            this.createColorObject(baseDark.mix(colorHex, 54), `800`),
            this.createColorObject(baseDark.mix(colorHex, 25), `900`),
            this.createColorObject(
                new TinyColor(baseDark)
                    .mix(undefined as any, 15)
                    .saturate(80)
                    .lighten(65),
                `A100`
            ),
            this.createColorObject(
                new TinyColor(baseDark)
                    .mix(undefined as any, 15)
                    .saturate(80)
                    .lighten(55),
                `A200`
            ),
            this.createColorObject(
                new TinyColor(baseDark)
                    .mix(undefined as any, 15)
                    .saturate(100)
                    .lighten(45),
                `A400`
            ),
            this.createColorObject(
                new TinyColor(baseDark)
                    .mix(undefined as any, 15)
                    .saturate(100)
                    .lighten(40),
                `A700`
            )
        ];
    }

    public createColorObject(colorHexRepresentation: TinyColor | string, name: string): ColorDefinition {
        const color = new TinyColor(colorHexRepresentation);
        return {
            name,
            hex: color.toHexString(),
            darkContrast: color.isLight()
        };
    }

    private multiplyColors(rgbA: RGBA, rgbB: RGBA): TinyColor {
        rgbA.b = Math.floor((<number>rgbA.b * <number>rgbB.b) / 255);
        rgbA.g = Math.floor((<number>rgbA.g * <number>rgbB.g) / 255);
        rgbA.r = Math.floor((<number>rgbA.r * <number>rgbB.r) / 255);
        return new TinyColor(`rgb ` + rgbA.r + ` ` + rgbA.g + ` ` + rgbA.b);
    }
}
