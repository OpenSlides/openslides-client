import { TestBed } from '@angular/core/testing';

import { ChatGroupControllerService } from './chat-group-controller.service';

describe('ChatGroupControllerService', () => {
    let service: ChatGroupControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatGroupControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
