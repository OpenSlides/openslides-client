import { TestBed } from '@angular/core/testing';

import { MotionCommentSectionRepositoryService } from './motion-comment-section-repository.service';

describe(`MotionCommentSectionRepositoryService`, () => {
    let service: MotionCommentSectionRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCommentSectionRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
