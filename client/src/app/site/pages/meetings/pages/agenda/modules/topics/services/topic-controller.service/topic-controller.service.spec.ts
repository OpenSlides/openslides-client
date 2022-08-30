import { TestBed } from '@angular/core/testing';

import { TopicControllerService } from './topic-controller.service';

xdescribe(`TopicControllerService`, () => {
    let service: TopicControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
