import { TestBed } from '@angular/core/testing';

import { ChatGroupDialogService } from './chat-group-dialog.service';

xdescribe(`ChatGroupDialogService`, () => {
    let service: ChatGroupDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatGroupDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
