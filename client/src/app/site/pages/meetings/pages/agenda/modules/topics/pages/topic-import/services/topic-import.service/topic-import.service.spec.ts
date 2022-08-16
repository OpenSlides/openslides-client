import { TestBed } from '@angular/core/testing';

import { TopicImportService } from './topic-import.service';

xdescribe(`TopicImportService`, () => {
    let service: TopicImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicImportService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
