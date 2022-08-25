import { TestBed } from '@angular/core/testing';

import { MainMenuService } from './main-menu.service';

xdescribe(`MainMenuService`, () => {
    let service: MainMenuService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MainMenuService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
