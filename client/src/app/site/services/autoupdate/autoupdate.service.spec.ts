import { TestBed } from '@angular/core/testing';

import { AutoupdateService } from './autoupdate.service';

xdescribe(`AutoupdateService`, () => {
    let service: AutoupdateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AutoupdateService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
