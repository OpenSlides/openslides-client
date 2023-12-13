import { TestBed } from '@angular/core/testing';
import { StorageService } from 'src/app/gateways/storage.service';

import { LifecycleService } from './lifecycle.service';

class MockStorageService {
    constructor() {}
    cleared = false;
    clear = () => (this.cleared = true);
}

describe(`LifecycleService`, () => {
    let service: LifecycleService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LifecycleService, { provide: StorageService, useClass: MockStorageService }]
        });
        service = TestBed.inject(LifecycleService);
    });

    it(`test isBooted`, async () => {
        expect(service.isBooted).toBe(false);
        service.bootup();
        expect(service.isBooted).toBe(true);
        service.shutdown();
        expect(service.isBooted).toBe(false);
    });

    it(`test openslidesBooted`, () => {
        let booted = false;
        service.openslidesBooted.subscribe(() => (booted = true));
        expect(service.isBooted).toBe(false);
        service.bootup();
        expect(service.isBooted).toBe(true);
        expect(booted).toBe(true);
    });

    it(`test openslidesShutdowned`, () => {
        let shutdowned = false;
        service.openslidesShutdowned.subscribe(() => (shutdowned = true));
        service.bootup();
        expect(service.isBooted).toBe(true);
        expect(shutdowned).toBe(false);
        service.shutdown();
        expect(service.isBooted).toBe(false);
        expect(shutdowned).toBe(true);
    });

    it(`check reboot()`, () => {
        let booted = false;
        let shutdowned = false;
        service.openslidesBooted.subscribe(() => (booted = true));
        service.openslidesShutdowned.subscribe(() => (shutdowned = true));
        expect(service.isBooted).toBe(false);
        service.reboot();
        expect(service.isBooted).toBe(true);
        expect(shutdowned).toBe(true);
        expect(booted).toBe(true);
    });

    it(`check reset()`, async () => {
        let booted = false;
        let shutdowned = false;
        service.openslidesBooted.subscribe(() => (booted = true));
        service.openslidesShutdowned.subscribe(() => (shutdowned = true));
        expect(service.isBooted).toBe(false);
        await service.reset();
        expect(service.isBooted).toBe(true);
        expect(shutdowned).toBe(true);
        expect(booted).toBe(true);
    });
});
