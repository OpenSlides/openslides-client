import { TestBed } from '@angular/core/testing';

import { CountUsersStatisticsService } from './count-users-statistics.service';

xdescribe(`CountUsersStatisticsService`, () => {
    let service: CountUsersStatisticsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CountUsersStatisticsService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
