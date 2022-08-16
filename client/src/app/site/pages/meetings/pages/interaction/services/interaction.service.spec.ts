import { TestBed } from '@angular/core/testing';

import { InteractionService } from './interaction.service';

xdescribe(`InteractionService`, () => {
    let service: InteractionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(InteractionService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
