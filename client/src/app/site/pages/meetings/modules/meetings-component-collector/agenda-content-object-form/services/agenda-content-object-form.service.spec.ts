import { TestBed } from '@angular/core/testing';

import { AgendaContentObjectFormService } from './agenda-content-object-form.service';

xdescribe(`AgendaContentObjectFormService`, () => {
    let service: AgendaContentObjectFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AgendaContentObjectFormService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
