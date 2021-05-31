import { Injectable } from '@angular/core';

import { HtmlColor } from '../definitions/key-types';

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
        this._value = color.startsWith('#') ? color.slice(1) : color;
    }
}

@Injectable({
    providedIn: 'root'
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
        const nextColor = [1, 1, 1].reduce(prevValue => prevValue + singleValue(), '');
        return `#${nextColor}`;
    }
}
