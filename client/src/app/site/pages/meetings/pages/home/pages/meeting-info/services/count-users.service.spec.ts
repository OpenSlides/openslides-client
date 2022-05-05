import { TestBed } from '@angular/core/testing';

import { CountUsersService } from './count-users.service';

describe('CountUsersService', () => {
    let service: CountUsersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CountUsersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
