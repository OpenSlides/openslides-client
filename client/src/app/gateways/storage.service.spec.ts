import { TestBed } from '@angular/core/testing';
import { StorageMap } from '@ngx-pwa/local-storage';
import { interval, map, Observable, takeWhile } from 'rxjs';

import { StorageService } from './storage.service';

class MockLocalStorage {
    public storage: Record<string, any> = {};

    private tick = interval(2);

    private current = 0;

    public constructor() {
        this.tick.subscribe(current => (this.current = current));
    }

    public set(key: string, item: any): Observable<boolean> {
        this.storage[key] = item;
        return this.getObservable(() => true);
    }

    public get<T>(key: string): Observable<T> {
        return this.getObservable(() => this.storage[key] as T);
    }

    public delete(key: string): Observable<boolean> {
        delete this.storage[key];
        return this.getObservable(() => true);
    }

    public clear(): Observable<boolean> {
        this.storage = {};
        return this.getObservable(() => true);
    }

    private getObservable<T>(getValueFn: () => T): Observable<T> {
        const current = this.current;
        return this.tick.pipe(
            takeWhile(time => time < current + 10),
            map(getValueFn)
        ) as Observable<T>;
    }
}

describe(`StorageService`, () => {
    let service: StorageService;
    let localStorage: MockLocalStorage;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [StorageService, { provide: StorageMap, useClass: MockLocalStorage }]
        });
        service = TestBed.inject(StorageService);
        localStorage = TestBed.inject(StorageMap) as unknown as MockLocalStorage;
    });

    it(`check if set works`, async () => {
        await service.set(`example`, `Something something text text text`);
        expect(localStorage.storage).toEqual({ example: `Something something text text text` });
    });

    it(`check if get works`, async () => {
        localStorage.storage[`example`] = `Something something text text text`;
        expect(await service.get<string>(`example`)).toBe(`Something something text text text`);
    });

    it(`check if remove works`, async () => {
        localStorage.storage = {
            example: `Something something text text text`,
            anotherExample: `Another something text`
        };
        await service.remove(`example`);
        expect(localStorage.storage).toEqual({
            anotherExample: `Another something text`
        });
    });

    it(`check if clear works`, async () => {
        localStorage.storage = {
            example: `Something something text text text`,
            anotherExample: `Another something text`
        };
        await service.clear();
        expect(localStorage.storage).toEqual({});
    });

    it(`check if addNoClearKey works`, async () => {
        localStorage.storage = {
            example: `Something something text text text`,
            anotherExample: `Another something text`
        };
        service.addNoClearKey(`anotherExample`);
        await service.clear();
        expect(localStorage.storage).toEqual({
            anotherExample: `Another something text`
        });
    });

    it(`check set with null`, async () => {
        localStorage.storage = {
            example: `Something something text text text`,
            anotherExample: `Another something text`
        };
        await service.set(`example`, null);
        expect(localStorage.storage).toEqual({
            anotherExample: `Another something text`
        });
    });

    it(`check set with undefined`, async () => {
        localStorage.storage = {
            example: `Something something text text text`,
            anotherExample: `Another something text`
        };
        await service.set(`example`, undefined);
        expect(localStorage.storage).toEqual({
            anotherExample: `Another something text`
        });
    });
});
