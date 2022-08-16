import { OnlyNumberDirective } from './only-number.directive';

xdescribe(`OnlyNumberDirective`, () => {
    it(`should create an instance`, () => {
        const directive = new OnlyNumberDirective(null);
        expect(directive).toBeTruthy();
    });
});
