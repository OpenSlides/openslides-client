import { TestBed } from '@angular/core/testing';

import { PollCandidateListRepositoryService } from './poll-candidate-list-repository.service';

xdescribe('PollCandidateListRepositoryService', () => {
  let service: PollCandidateListRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PollCandidateListRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
