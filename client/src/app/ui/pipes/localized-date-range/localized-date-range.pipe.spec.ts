import { LocalizedDateRangePipe } from './localized-date-range.pipe';

xdescribe(`LocalizedDateRangePipe`, () => {
    it(`create an instance`, () => {
        const pipe = new LocalizedDateRangePipe();
        expect(pipe).toBeTruthy();
    });
});
