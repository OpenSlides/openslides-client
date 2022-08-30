import { TestBed } from '@angular/core/testing';

import { ScrollingTableManageService } from './scrolling-table-manage.service';

xdescribe(`ScrollingTableManageService`, () => {
    let service: ScrollingTableManageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ScrollingTableManageService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
