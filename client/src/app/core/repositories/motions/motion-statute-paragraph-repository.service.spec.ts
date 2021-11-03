import { inject, TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { MotionStatuteParagraphRepositoryService } from './motion-statute-paragraph-repository.service';

describe(`MotionStatuteParagraphRepositoryService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [MotionStatuteParagraphRepositoryService]
        });
    });

    it(`should be created`, inject(
        [MotionStatuteParagraphRepositoryService],
        (service: MotionStatuteParagraphRepositoryService) => {
            expect(service).toBeTruthy();
        }
    ));
});
