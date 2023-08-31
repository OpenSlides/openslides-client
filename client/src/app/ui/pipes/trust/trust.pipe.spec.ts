import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

import { TrustPipe } from './trust.pipe';

describe(`TrustPipe`, () => {
    let pipe: TrustPipe;
    let domSanitizer: DomSanitizer;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrowserModule],
            providers: [TrustPipe]
        }).compileComponents();

        domSanitizer = TestBed.inject(DomSanitizer);
        pipe = TestBed.inject(TrustPipe);
    });

    it(`test sanitizes html`, () => {
        const html = pipe.transform(`<i>Test</i>`, `html`);
        expect(html).toEqual(domSanitizer.bypassSecurityTrustHtml(`<i>Test</i>`));
    });

    it(`test sanitizes style`, () => {
        const style = pipe.transform(`backgroud: red`, `style`);
        expect(style).toEqual(domSanitizer.bypassSecurityTrustStyle(`backgroud: red`));
    });

    it(`test sanitizes script`, () => {
        const js = pipe.transform(`alert('hi')`, `script`);
        expect(js).toEqual(domSanitizer.bypassSecurityTrustScript(`alert('hi')`));
    });

    it(`test sanitizes url`, () => {
        const url = pipe.transform(`javascript:alert('hi')`, `url`);
        expect(url).toEqual(domSanitizer.bypassSecurityTrustUrl(`javascript:alert('hi')`));
    });

    it(`test sanitizes resourceUrl`, () => {
        const url = pipe.transform(`test://foo`, `resourceUrl`);
        expect(url).toEqual(domSanitizer.bypassSecurityTrustResourceUrl(`test://foo`));
    });

    it(`test throws on invalid sanitizer type`, () => {
        expect(() => pipe.transform(`invalid`, `invalid`)).toThrow(new Error(`Invalid safe type specified: invalid`));
    });
});
