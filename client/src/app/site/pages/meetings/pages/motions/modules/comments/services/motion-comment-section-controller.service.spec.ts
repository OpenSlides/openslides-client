import { TestBed } from '@angular/core/testing';

import { MotionCommentSectionControllerService } from './motion-comment-section-controller.service';

xdescribe(`MotionCommentSectionControllerService`, () => {
    let service: MotionCommentSectionControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCommentSectionControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
