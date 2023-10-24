import { TestBed } from '@angular/core/testing';

import { HtmlColor } from '../../domain/definitions/key-types';
import { Color, ColorService } from './color.service';

describe(`ColorService`, () => {
    let service: ColorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ColorService]
        });
        service = TestBed.inject(ColorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });

    it(`parse html color to color`, () => {
        const value: HtmlColor = `#aa11ff`;
        expect(service.parseHtmlColorToColor(value)).toEqual(new Color(value));
    });

    it(`parse html color and check color parts`, () => {
        const value: HtmlColor = `#aa11ff`;
        expect(service.parseHtmlColorToColor(value).blue).toEqual(parseInt(`ff`, 16).toString());
        expect(service.parseHtmlColorToColor(value).green).toEqual(parseInt(`11`, 16).toString());
        expect(service.parseHtmlColorToColor(value).red).toEqual(parseInt(`aa`, 16).toString());
        expect(service.parseHtmlColorToColor(value).value).toEqual(value);
    });

    it(`get random color`, () => {
        expect(service.getRandomHtmlColor()).toMatch(/#[0-9abcdef]{6}/);
    });

    it(`generate color palette`, () => {
        expect(service.generateColorPaletteByHex(`aa11ff`).length).toBe(14);
    });

    it(`create color object`, () => {
        expect(service.createColorObject(`aa11ff`, `test-color`)).toEqual({
            name: `test-color`,
            hex: `#aa11ff`,
            darkContrast: false
        });
    });

    it(`is light from hex`, () => {
        expect(service.isLightFromHex(`#110011`)).toBe(false);
        expect(service.isLightFromHex(`#ffeeff`)).toBe(true);
    });
});
