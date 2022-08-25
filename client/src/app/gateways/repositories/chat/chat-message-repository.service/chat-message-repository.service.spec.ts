import { TestBed } from '@angular/core/testing';

import { ChatMessageRepositoryService } from './chat-message-repository.service';

xdescribe(`ChatMessageRepositoryService`, () => {
    let service: ChatMessageRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatMessageRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
