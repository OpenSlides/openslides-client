import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import fetchMock from 'fetch-mock';
import { firstValueFrom, lastValueFrom, skip, take } from 'rxjs';
import { LifecycleService } from 'src/app/site/services/lifecycle.service';

import { ServerTimeService } from './server-time.service';

class MockLifecycleService {
    public readonly appLoaded = new EventEmitter<void>();

    public constructor() {
        this.emit();
    }

    private async emit(): Promise<void> {
        await new Promise(res => setTimeout(res, 300)).then(() => this.appLoaded.next());
    }
}

describe(`ServerTimeService`, () => {
    let service: ServerTimeService;

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            providers: [ServerTimeService, { provide: LifecycleService, useClass: MockLifecycleService }]
        });

        service = TestBed.inject(ServerTimeService);
        vi.spyOn(console, `error`).mockReturnValue(undefined);
        fetchMock.mockGlobal();
    });

    afterEach(() => {
        vi.useRealTimers();
        fetchMock.hardReset();
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

    it.skip(`should update getServerOffsetObservable correctly`, async () => {
        fetchMock.get(`/assets/time.txt`, {
            headers: {
                Date: new Date(Math.floor(Date.now() / 1000) - 10).toUTCString()
            }
        });

        vi.advanceTimersByTime(1000);
        const serverOffset = Math.floor(
            (await lastValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)))) / 1000
        );
        expect(serverOffset).toBeLessThanOrEqual(10);
        expect(serverOffset).toBeGreaterThanOrEqual(9);
    });

    it.skip(`should retry`, async () => {
        fetchMock.get(
            `/assets/time.txt`,
            {
                headers: {
                    Date: `invalid`
                }
            },
            {
                name: `time.txt`
            }
        );

        vi.advanceTimersByTime(300);
        const updatedPromise = firstValueFrom(service.getServerOffsetObservable().pipe(skip(1), take(1)));
        fetchMock.modifyRoute(`time.txt`, {
            headers: {
                Date: new Date().toUTCString()
            }
        });
        await expect(updatedPromise).resolves.not.toThrow();
        expect(console.error).toHaveBeenCalled();
    });
});
