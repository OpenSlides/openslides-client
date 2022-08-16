import { TestBed } from '@angular/core/testing';

import { OmlPermsDirective } from './oml-perms.directive';

xdescribe(`OmlPermsDirective`, () => {
    let directive: OmlPermsDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(OmlPermsDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
