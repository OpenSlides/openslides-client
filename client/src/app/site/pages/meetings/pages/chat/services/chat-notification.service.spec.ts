import { TestBed } from '@angular/core/testing';

import { ChatNotificationService } from './chat-notification.service';

describe(`ChatNotificationService`, () => {
    let service: ChatNotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatNotificationService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
