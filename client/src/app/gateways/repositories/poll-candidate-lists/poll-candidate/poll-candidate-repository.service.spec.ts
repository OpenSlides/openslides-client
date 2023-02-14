import { TestBed } from '@angular/core/testing';

import { PollCandidateRepositoryService } from './poll-candidate-repository.service';

xdescribe('PollCandidateRepositoryService', () => {
  let service: PollCandidateRepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PollCandidateRepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
