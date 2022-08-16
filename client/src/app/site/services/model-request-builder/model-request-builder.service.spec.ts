import { TestBed } from '@angular/core/testing';

import { ModelRequestBuilderService } from './model-request-builder.service';

xdescribe(`ModelRequestBuilderService`, () => {
    let service: ModelRequestBuilderService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModelRequestBuilderService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
