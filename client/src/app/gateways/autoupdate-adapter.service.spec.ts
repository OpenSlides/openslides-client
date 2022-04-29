import { TestBed } from '@angular/core/testing';

import { AutoupdateAdapterService } from './autoupdate-adapter.service';

describe('AutoupdateAdapterService', () => {
    let service: AutoupdateAdapterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AutoupdateAdapterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
