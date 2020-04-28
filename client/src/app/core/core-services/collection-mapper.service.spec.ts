import { inject, TestBed } from '@angular/core/testing';

import { CollectionMapperService } from './collection-mapper.service';
import { E2EImportsModule } from '../../../e2e-imports.module';

describe('CollectionMapperService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [CollectionMapperService]
        });
    });

    it('should be created', inject([CollectionMapperService], (service: CollectionMapperService) => {
        expect(service).toBeTruthy();
    }));
});
