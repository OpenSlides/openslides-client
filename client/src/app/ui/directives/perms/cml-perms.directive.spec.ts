import { TestBed } from '@angular/core/testing';

import { CmlPermsDirective } from './cml-perms.directive';

xdescribe(`CmlPermsDirective`, () => {
    let directive: CmlPermsDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(CmlPermsDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
