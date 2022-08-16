import { TestBed } from '@angular/core/testing';

import { RepositoryMeetingServiceCollectorService } from './repository-meeting-service-collector.service';

xdescribe(`RepositoryMeetingServiceCollectorService`, () => {
    let service: RepositoryMeetingServiceCollectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RepositoryMeetingServiceCollectorService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
