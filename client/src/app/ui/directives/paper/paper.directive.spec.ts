import { TestBed } from '@angular/core/testing';

import { PaperDirective } from './paper.directive';

xdescribe(`PaperDirective`, () => {
    let directive: PaperDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(PaperDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
