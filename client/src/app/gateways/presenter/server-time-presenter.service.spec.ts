import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom, skip, take } from 'rxjs';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';
import { ServerTimePresenterService } from './server-time-presenter.service';

class MockLifecycleService {
    public readonly appLoaded = new EventEmitter<void>();

    public constructor() {
        this.emit();
    }

    private async emit(): Promise<void> {
        await new Promise(res => setTimeout(res, 300)).then(() => this.appLoaded.next());
    }
}

describe(`ServerTimePresenterService`, () => {
    let service: ServerTimePresenterService;
    let presenter: MockPresenterService;

    let offset: number;
    let forceFailureOnNext: boolean;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ServerTimePresenterService,
                { provide: PresenterService, useClass: MockPresenterService },
                { provide: LifecycleService, useClass: MockLifecycleService }
            ]
        });

        offset = 0;
        forceFailureOnNext = false;

        service = TestBed.inject(ServerTimePresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.SERVERTIME, (data?: any) => {
            if (!!data) {
                return { error: `MockPresenterService: Data has wrong format` };
            }
            if (forceFailureOnNext) {
                forceFailureOnNext = !forceFailureOnNext;
                return { returnValue: { server_time: `3 o' clock` } };
            }
            return {
                returnValue: { server_time: Math.floor(Date.now() / 1000) - offset }
            };
        });
        spyOn(console, `error`);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it(`should correctly call server_time`, async () => {
        const servertime = service.getServertime();
        const now = Date.now();
        expect(servertime).toBeLessThanOrEqual(now);
        expect(servertime).toBeGreaterThanOrEqual(now - 1);
    });

    it(
        `should update getServerOffsetObservable correctly`,
        async () => {
            offset = 10;
            const serverOffset = Math.floor(
                (await lastValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)))) / 1000
            );
            expect(serverOffset).toBeLessThanOrEqual(10);
            expect(serverOffset).toBeGreaterThanOrEqual(9);
        },
        60 * 1000 * 5
    );

    it(
        `should retry`,
        async () => {
            forceFailureOnNext = true;
            const updatedPromise = firstValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)));
            await expectAsync(updatedPromise).toBeResolved();
            expect(console.error).toHaveBeenCalled();
        },
        60 * 1000 * 5 + 30 * 1000
    );
});
