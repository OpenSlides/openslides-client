import { TestBed } from '@angular/core/testing';

import { PersonalNoteControllerService } from './personal-note-controller.service';

describe('PersonalNoteControllerService', () => {
    let service: PersonalNoteControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PersonalNoteControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
