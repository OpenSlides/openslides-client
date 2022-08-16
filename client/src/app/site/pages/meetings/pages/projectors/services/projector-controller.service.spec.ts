import { TestBed } from '@angular/core/testing';

import { ProjectorControllerService } from './projector-controller.service';

xdescribe(`ProjectorControllerService`, () => {
    let service: ProjectorControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProjectorControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
