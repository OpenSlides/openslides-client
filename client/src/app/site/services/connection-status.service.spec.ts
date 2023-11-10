import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { BannerDefinition, BannerService } from '../modules/site-wrapper/services/banner.service';
import { ConnectionStatusService } from './connection-status.service';

class MockBannerService {
    added: BannerDefinition;
    removed: BannerDefinition;
    constructor() {}
    addBanner = (key: BannerDefinition) => (this.added = key);
    removeBanner = (key: BannerDefinition) => (this.removed = key);
}

describe(`ConnectionStatusService`, () => {
    let service: ConnectionStatusService;
    let bannerService: BannerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ConnectionStatusService, { provide: BannerService, useClass: MockBannerService }]
        });
        service = TestBed.inject(ConnectionStatusService);
        bannerService = TestBed.inject(BannerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });

    it(
        `check defer check still offline with goOffline`,
        <any>fakeAsync(() => {
            let status = false;
            service.goOffline({ reason: `test`, isOnlineFn: () => status });
            expect(service.isOffline()).toBe(true);
            tick(6000);
            expect((bannerService as unknown as MockBannerService).added?.icon).toEqual(`cloud_off`);
            status = true;
            tick(6000);
            expect(service.isOffline()).toBe(false);
            expect((bannerService as unknown as MockBannerService).removed?.icon).toEqual(`cloud_off`);
        })
    );

    it(`offlineGone`, () => {
        let setOffline = false;
        const status = false;
        service.offlineGone.subscribe(() => (setOffline = true));
        expect(setOffline).toBe(false);
        service.goOffline({ reason: `test`, isOnlineFn: () => status });
        expect(setOffline).toBe(true);
    });

    it(`onlineGone`, fakeAsync(() => {
        let setOnline = false;
        let status = false;
        service.goOffline({ reason: `test`, isOnlineFn: () => status });
        service.onlineGone.subscribe(() => (setOnline = true));
        expect(setOnline).toBe(false);
        // go online again
        status = true;
        tick(6000);
        expect(setOnline).toBe(true);
    }));

    it("isOfflineObservable", () => {
        let value = false;
        service.isOfflineObservable.subscribe((v) => value = v);
        service.goOffline({ reason: `test`, isOnlineFn: () => false });
        expect(value).toBe(true);
    });

    it("getReason", () => {
        expect(service.getReason()).toBe(null);
        service.goOffline({ reason: `test`, isOnlineFn: () => false });
        expect(service.getReason()).toBe('test');
    });


    it("isOffline", () => {
        expect(service.isOffline()).toBe(false);
        service.goOffline({ reason: `test`, isOnlineFn: () => false });
        expect(service.isOffline()).toBe(true);
    });

});
