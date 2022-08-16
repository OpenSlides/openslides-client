import { TestBed } from '@angular/core/testing';

import { AutofocusDirective } from './autofocus.directive';

xdescribe(`AutofocusDirective`, () => {
    let directive: AutofocusDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(AutofocusDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
