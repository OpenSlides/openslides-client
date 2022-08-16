import { TestBed } from '@angular/core/testing';

import { UserControllerService } from './user-controller.service';

xdescribe(`UserControllerService`, () => {
    let service: UserControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
