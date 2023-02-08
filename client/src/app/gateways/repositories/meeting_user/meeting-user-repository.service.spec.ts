import { TestBed } from '@angular/core/testing';

import { MeetingUserRepositoryService } from './meeting-user-repository.service';

xdescribe(`MeetingUserRepositoryService`, () => {
    let service: MeetingUserRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MeetingUserRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
