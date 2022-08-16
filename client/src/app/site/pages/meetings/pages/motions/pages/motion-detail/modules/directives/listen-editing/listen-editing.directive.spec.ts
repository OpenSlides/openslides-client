import { TestBed } from '@angular/core/testing';

import { ListenEditingDirective } from './listen-editing.directive';

xdescribe(`ListenEditingDirective`, () => {
    let directive: ListenEditingDirective;

    beforeEach(async () => {
        await TestBed.configureTestingModule({}).compileComponents();

        directive = TestBed.inject(ListenEditingDirective);
    });

    it(`should create an instance`, () => {
        expect(directive).toBeTruthy();
    });
});
