import { TestBed } from '@angular/core/testing';

import { ChatMessageControllerService } from './chat-message-controller.service';

describe('ChatMessageControllerService', () => {
    let service: ChatMessageControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatMessageControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
