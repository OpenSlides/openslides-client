import { TestBed } from '@angular/core/testing';

import { ThemeBuilderDialogService } from './theme-builder-dialog.service';

xdescribe(`ThemeBuilderDialogService`, () => {
    let service: ThemeBuilderDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeBuilderDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
