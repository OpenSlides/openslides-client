import { TestBed } from '@angular/core/testing';

import { MotionCommentControllerService } from './motion-comment-controller.service';

describe('MotionCommentControllerService', () => {
    let service: MotionCommentControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCommentControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
