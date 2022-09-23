import { TestBed } from '@angular/core/testing';

import { WorkflowExportService } from './workflow-export.service';

xdescribe(`WorkflowExportService`, () => {
    let service: WorkflowExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WorkflowExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
