import { TestBed } from '@angular/core/testing';

import { ProjectorMessageControllerService } from './projector-message-controller.service';

xdescribe(`ProjectorMessageControllerService`, () => {
    let service: ProjectorMessageControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorMessageControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
