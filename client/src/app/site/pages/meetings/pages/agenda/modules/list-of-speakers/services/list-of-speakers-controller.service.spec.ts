import { TestBed } from '@angular/core/testing';

import { ListOfSpeakersControllerService } from './list-of-speakers-controller.service';

xdescribe(`ListOfSpeakersControllerService`, () => {
    let service: ListOfSpeakersControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ListOfSpeakersControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
