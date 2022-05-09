import { TestBed } from '@angular/core/testing';

import { AppInjector } from './app-injector.service';

describe(`AppInjector`, () => {
    let service: AppInjector;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AppInjector);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
