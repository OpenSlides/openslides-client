import { TestBed } from '@angular/core/testing';

import { AppLoadService } from './app-load.service';

xdescribe(`AppLoadService`, () => {
    let service: AppLoadService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppLoadService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
