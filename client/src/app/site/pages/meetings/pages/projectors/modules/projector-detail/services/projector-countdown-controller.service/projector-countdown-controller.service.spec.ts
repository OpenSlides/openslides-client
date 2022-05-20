import { TestBed } from '@angular/core/testing';

import { ProjectorCountdownControllerService } from './projector-countdown-controller.service';

describe(`ProjectorCountdownControllerService`, () => {
    let service: ProjectorCountdownControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorCountdownControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
