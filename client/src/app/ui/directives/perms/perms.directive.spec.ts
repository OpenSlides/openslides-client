import { TestBed } from '@angular/core/testing';

import { PermsDirective } from './perms.directive';

xdescribe(`PermsDirective`, () => {
    let directive: PermsDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(PermsDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
