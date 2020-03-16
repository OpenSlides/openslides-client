import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../e2e-imports.module';
import { StreamingCommunicationService } from './streaming-communication.service';

describe('StreamingCommunicationService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [StreamingCommunicationService]
        });
    });

    it('should be created', inject([StreamingCommunicationService], (service: StreamingCommunicationService) => {
        expect(service).toBeTruthy();
    }));
});
