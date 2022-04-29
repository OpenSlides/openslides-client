import { TestBed } from '@angular/core/testing';

import { TopicRepositoryService } from './topic-repository.service';

describe('TopicRepositoryService', () => {
    let service: TopicRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TopicRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
