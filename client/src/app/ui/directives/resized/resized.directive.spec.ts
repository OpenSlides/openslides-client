import { TestBed } from '@angular/core/testing';

import { ResizedDirective } from './resized.directive';

xdescribe(`ResizedDirective`, () => {
    let directive: ResizedDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(ResizedDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
