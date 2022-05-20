import { TestBed } from '@angular/core/testing';

import { MotionCommentRepositoryService } from './motion-comment-repository.service';

describe(`MotionCommentRepositoryService`, () => {
    let service: MotionCommentRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCommentRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
