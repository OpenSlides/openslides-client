import { TestBed } from '@angular/core/testing';

import { ChatGroupRepositoryService } from './chat-group-repository.service';

xdescribe(`ChatGroupRepositoryService`, () => {
    let service: ChatGroupRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatGroupRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
