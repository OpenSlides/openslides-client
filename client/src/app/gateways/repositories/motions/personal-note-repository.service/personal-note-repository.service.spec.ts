import { TestBed } from '@angular/core/testing';

import { PersonalNoteRepositoryService } from './personal-note-repository.service';

xdescribe(`PersonalNoteRepositoryService`, () => {
    let service: PersonalNoteRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PersonalNoteRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
