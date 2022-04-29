import { TestBed } from '@angular/core/testing';

import { MotionStatuteParagraphRepositoryService } from './motion-statute-paragraph-repository.service';

describe('MotionStatuteParagraphRepositoryService', () => {
    let service: MotionStatuteParagraphRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionStatuteParagraphRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
