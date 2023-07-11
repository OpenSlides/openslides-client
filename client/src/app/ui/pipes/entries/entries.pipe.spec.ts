import { KeyValue } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { EntriesPipe } from './entries.pipe';

describe(`EntriesPipe`, () => {
    let pipe: EntriesPipe;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [EntriesPipe]
        }).compileComponents();

        pipe = TestBed.inject(EntriesPipe);
    });

    it(`check if map is converted`, () => {
        const m = new Map([
            [`a`, 1],
            [`c`, 3],
            [`b`, 2]
        ]);

        const res = pipe.transform(m);
        expect(res).toEqual([
            { key: `a`, value: 1 },
            { key: `c`, value: 3 },
            { key: `b`, value: 2 }
        ]);
    });

    it(`check if map gets sorted`, () => {
        const m = new Map([
            [`a`, 1],
            [`c`, 3],
            [`b`, 2]
        ]);

        const res = pipe.transform(m, <K, V>(a: KeyValue<K, V>, b: KeyValue<K, V>) => {
            if (a.key === b.key) {
                return 0;
            }
            if (a.key === null || a.key === undefined) {
                return 1;
            }
            if (b.key === null || b.key === undefined) {
                return -1;
            }

            return a.key < b.key ? -1 : 1;
        });

        expect(res).toEqual([
            { key: `a`, value: 1 },
            { key: `b`, value: 2 },
            { key: `c`, value: 3 }
        ]);
    });
});
