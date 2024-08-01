import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import fetchMock from 'fetch-mock';
import { firstValueFrom, lastValueFrom, skip, take } from 'rxjs';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

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

fdescribe(`ServerTimePresenterService`, () => {
    let service: ServerTimePresenterService;

    beforeEach(() => {
        jasmine.clock().install();
        TestBed.configureTestingModule({
            providers: [ServerTimePresenterService, { provide: LifecycleService, useClass: MockLifecycleService }]
        });

        service = TestBed.inject(ServerTimePresenterService);
        spyOn(console, `error`);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        fetchMock.reset();
    });

    it(`should correctly call server_time`, async () => {
        fetchMock.get(`/assets/time.txt`, {
            headers: {
                Date: new Date().toUTCString()
            }
        });

        const servertime = service.getServertime();
        const now = Date.now();
        expect(servertime).toBeLessThanOrEqual(now);
        expect(servertime).toBeGreaterThanOrEqual(now - 1);
    });

    xit(`should update getServerOffsetObservable correctly`, async () => {
        fetchMock.get(`/assets/time.txt`, {
            headers: {
                Date: new Date(Math.floor(Date.now() / 1000) - 10).toUTCString()
            }
        });

        jasmine.clock().tick(1000);
        const serverOffset = Math.floor(
            (await lastValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)))) / 1000
        );
        expect(serverOffset).toBeLessThanOrEqual(10);
        expect(serverOffset).toBeGreaterThanOrEqual(9);
    });

    xit(`should retry`, async () => {
        fetchMock.get(`/assets/time.txt`, {
            headers: {
                Date: `invalid`
            }
        });

        jasmine.clock().tick(300);
        const updatedPromise = firstValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)));
        fetchMock.get(
            `/assets/time.txt`,
            {
                headers: {
                    Date: new Date().toUTCString()
                }
            },
            { overwriteRoutes: true }
        );
        await expectAsync(updatedPromise).toBeResolved();
        expect(console.error).toHaveBeenCalled();
    });
});
