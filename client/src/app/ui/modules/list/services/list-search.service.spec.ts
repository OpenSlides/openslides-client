import { BehaviorSubject, filter, firstValueFrom, map, skip } from 'rxjs';

import { ListSearchService } from './list-search.service';

class MockIdentifiable {
    public constructor(
        public id: number,
        public en: string,
        public ti: boolean,
        private _fi: (originItem: MockIdentifiable) => string,
        public ab: { data: string },
        public le?: number[]
    ) {}

    public fi(): string {
        return this._fi(this);
    }
}

describe(`ListSearchService`, () => {
    let service: ListSearchService<MockIdentifiable>;

    const data = {
        strings: [`an`, `apple`, `a`, `day`, `keeps`, `the`, `doctor`, `away`],
        numbers: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        booleans: [true, false, false, true, true, true, false, true, false],
        functions: [
            (originItem: MockIdentifiable) => originItem.en,
            () => `banana`,
            (originItem: MockIdentifiable) => originItem.ab.data
        ],
        generate: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 92]
    };

    function getSourceData(length = 25): MockIdentifiable[] {
        return Array.from({ length }, (value, index) => index).map(
            id =>
                new MockIdentifiable(
                    id,
                    data.strings[id % data.strings.length],
                    data.booleans[id % data.booleans.length],
                    data.functions[id % data.functions.length],
                    {
                        data: data.strings[(id + 3) % data.strings.length].split(``).reverse().join(``)
                    },
                    data.generate.slice(
                        data.generate[id % data.generate.length] % data.generate.length,
                        Math.max(
                            id % data.generate.length,
                            data.generate[id % data.generate.length] % data.generate.length
                        ) + 1
                    )
                )
        );
    }

    function generateService(filterProps: string[], alsoFilterByProperties: string[] = []): void {
        service = new ListSearchService(filterProps, alsoFilterByProperties);
    }

    function getWaitUntilPromiseForService(
        condition: (data: MockIdentifiable[]) => boolean,
        skipOver = 0
    ): Promise<number[]> {
        return firstValueFrom(
            service.outputObservable.pipe(
                filter(condition),
                skip(skipOver),
                map(arr => arr.map(item => item.id))
            )
        );
    }

    afterEach(() => {
        service.exitSearchService();
    });

    it(`test search without properties`, async () => {
        generateService([]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`apple`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25, 1)).toBePending();
    });

    it(`test search without data`, async () => {
        generateService([`en`]);
        service.initSearchService(new BehaviorSubject([]));
        expect(() => service.search(`apple`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 0, 1)).toBePending();
    });

    it(`test search with data and properites`, async () => {
        generateService([`ti`]);
        service.initSearchService(new BehaviorSubject(getSourceData(10)));
        expect(() => service.search(`true`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([0, 3, 4, 5, 7, 9]);
    });

    it(`test search with alsoFilterByProperties`, async () => {
        generateService([`ti`], [`en`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`doctor`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([6, 14, 22]);
    });

    it(`test search trim`, async () => {
        generateService([`ti`], [`en`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`doctor `)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([6, 14, 22]);
    });

    it(`test search function`, async () => {
        generateService([`fi`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`doctor`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([6]);
        service.exitSearchService();
        generateService([`fi`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`banana`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([
            1, 4, 7, 10, 13, 16, 19, 22
        ]);
    });

    it(`test search number`, async () => {
        generateService([`id`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`5`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([5, 15]);
    });

    it(`test search array`, async () => {
        generateService([`le`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`5`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([
            4, 5, 6, 8, 9, 10, 11, 12, 17, 18, 19, 21, 22, 23, 24
        ]);
    });

    it(`test if search doesn't include other property values`, async () => {
        generateService([`ti`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`doctor`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([]);
    });

    it(`test search with multiple properties`, async () => {
        generateService([`le`, `id`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`5`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([
            4, 5, 6, 8, 9, 10, 11, 12, 15, 17, 18, 19, 21, 22, 23, 24
        ]);
    });

    it(`test search with multiple properties of different types`, async () => {
        generateService([`en`, `id`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`5`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([5, 15]);
    });

    it(`test if really only the first additional property is searched`, async () => {
        generateService([`ti`], [`en`, `id`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`5`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([]);
    });

    it(`test if the second additional property is used, if the first isn't filled`, async () => {
        generateService([`ti`], [`le`, `en`]);
        service.initSearchService(
            new BehaviorSubject(
                getSourceData(25).map((val, index) =>
                    index % 2 ? val : new MockIdentifiable(val.id, val.en, val.ti, val.fi, val.ab)
                )
            )
        );
        expect(() => service.search(`a`)).not.toThrow();
        // does not contain uneven ids, even though `en` for 1 should be `apple`
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([
            0, 2, 8, 10, 16, 18, 24
        ]);
    });

    it(`test search with nested properties`, async () => {
        generateService([`ab.data`]);
        service.initSearchService(new BehaviorSubject(getSourceData(25)));
        expect(() => service.search(`elppa`)).not.toThrow();
        await expectAsync(getWaitUntilPromiseForService(data => data.length !== 25)).toBeResolvedTo([6, 14, 22]);
    });
});
