import { TestBed } from '@angular/core/testing';

import { EasterEggContentPlatformService } from './easter-egg-content-platform.service';

xdescribe(`EasterEggContentPlatformService`, () => {
    let service: EasterEggContentPlatformService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(EasterEggContentPlatformService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
