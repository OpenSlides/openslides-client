import { TestBed } from '@angular/core/testing';

import { TopicExportService } from './topic-export.service';

xdescribe(`TopicExportService`, () => {
    let service: TopicExportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicExportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
