import { TestBed } from '@angular/core/testing';

import { MotionEditorControllerService } from './motion-editor-controller.service';

xdescribe(`MotionEditorControllerService`, () => {
    let service: MotionEditorControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionEditorControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
