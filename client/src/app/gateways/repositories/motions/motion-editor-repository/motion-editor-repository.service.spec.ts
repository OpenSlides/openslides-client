import { TestBed } from '@angular/core/testing';

import { MotionEditorRepositoryService } from './motion-editor-repository.service';

xdescribe(`MotionEditorRepositoryService`, () => {
    let service: MotionEditorRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionEditorRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
