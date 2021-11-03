import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { MotionLineNumberingService } from './motion-line-numbering.service';

describe(`MotionLineNumberingService`, () => {
    let service: MotionLineNumberingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule]
        });
        service = TestBed.inject(MotionLineNumberingService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
