import { TestBed } from '@angular/core/testing';

import { MotionStatuteParagraphControllerService } from './motion-statute-paragraph-controller.service';

describe('MotionStatuteParagraphControllerService', () => {
    let service: MotionStatuteParagraphControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionStatuteParagraphControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
