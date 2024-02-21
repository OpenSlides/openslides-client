import { TestBed } from '@angular/core/testing';
import { Id } from 'src/app/domain/definitions/key-types';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { Motion } from 'src/app/domain/models/motions';
import { User } from 'src/app/domain/models/users/user';
import { QueryParams } from 'src/app/infrastructure/definitions/http';
import { collectionIdFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { UserControllerService } from 'src/app/site/services/user-controller.service';

import { HttpService, RequestSettings } from '../http.service';
import { HistoryPosition, HistoryPresenterService } from './history-presenter.service';

function getMultiple<T>(of: T, amount = 1): T[] {
    return new Array(amount).fill(of);
}

function getTime(x: number): number {
    return 1111111111.111111 * x;
}

function getAssignmentHistory(id: Id, addDuplicates = false): any {
    return {
        [`assignment/${id}`]: [
            ...getMultiple(
                {
                    position: 18,
                    timestamp: getTime(1),
                    user_id: 1,
                    information: [`Candidate added`]
                },
                addDuplicates ? 2 : 1
            ),
            {
                position: 21,
                timestamp: getTime(2),
                user_id: 1,
                information: [`Candidate removed`]
            },
            {
                position: 22,
                timestamp: getTime(3),
                user_id: 1,
                information: [`Candidate added`]
            },
            {
                position: 23,
                timestamp: getTime(4),
                user_id: 1,
                information: [`Candidate added`]
            },
            {
                position: 25,
                timestamp: getTime(5),
                user_id: 1,
                information: [`Ballot created`]
            },
            {
                position: 26,
                timestamp: getTime(6),
                user_id: 1,
                information: [`Ballot published`]
            },
            {
                position: 30,
                timestamp: getTime(7),
                user_id: 1,
                information: [`Ballot created`]
            },
            {
                position: 31,
                timestamp: getTime(8),
                user_id: 1,
                information: [`Ballot started`]
            },
            {
                position: 33,
                timestamp: getTime(9),
                user_id: 1,
                information: [`Ballot stopped/published`]
            }
        ]
    };
}

function getUserHistory(id: Id, addDuplicates = false): any {
    return {
        [`user/${id}`]: [
            ...getMultiple(
                {
                    position: 20,
                    timestamp: getTime(1),
                    user_id: 1,
                    information: { [`user/${id}`]: [`Participant created in meeting {}`, `meeting/2`] }
                },
                addDuplicates ? 3 : 1
            ),
            {
                position: 23,
                timestamp: getTime(2),
                user_id: 1,
                information: { [`assignment/3`]: [`Candidate added`] }
            },
            ...getMultiple(
                {
                    position: 24,
                    timestamp: getTime(3),
                    user_id: 1,
                    information: {
                        [`user/${id}`]: [`Personal data changed`, `Participant data updated in meeting {}`, `meeting/2`]
                    }
                },
                addDuplicates ? 2 : 1
            ),
            {
                position: 25,
                timestamp: getTime(4),
                user_id: 1,
                information: { [`assignment/3`]: [`Ballot created`] }
            },
            {
                position: 30,
                timestamp: getTime(5),
                user_id: 1,
                information: { [`assignment/3`]: [`Ballot created`] }
            }
        ]
    };
}

function getMotionHistory(id: Id, addDuplicates = false): any {
    return {
        [`motion/${id}`]: [
            ...getMultiple(
                {
                    position: 67,
                    timestamp: getTime(1),
                    user_id: 1,
                    information: {
                        [`motion/${id}`]: [`Motion created`]
                    }
                },
                addDuplicates ? 2 : 1
            ),
            {
                position: 70,
                timestamp: getTime(2),
                user_id: 1,
                information: {
                    [`motion/${id}`]: [`Category set to {}`, `motion_category/3`]
                }
            },
            {
                position: 72,
                timestamp: getTime(3),
                user_id: 1,
                information: {
                    [`motion/${id + 1}`]: [`Number set`],
                    [`motion/${id}`]: [`Number set`]
                }
            }
        ]
    };
}

function getHistory(collection: string, id: Id, addDuplicates = false): any {
    switch (collection) {
        case Motion.COLLECTION:
            return getMotionHistory(id, addDuplicates);
        case Assignment.COLLECTION:
            return getAssignmentHistory(id, addDuplicates);
        case User.COLLECTION:
            return getUserHistory(id, addDuplicates);
        default:
            throw new Error(`Collection '${collection}' is not known`);
    }
}

class MockHttpService {
    public lastPosts: { path: string; data: any; queryParams: QueryParams }[] = [];

    public addDuplicates = true;

    public constructor() {}

    public async post<R>(path: string, data: any, { queryParams }: RequestSettings): Promise<R> {
        this.lastPosts.push({ path, data, queryParams });
        if (
            path !== `/system/autoupdate/history_information` ||
            Object.keys(queryParams).length !== 1 ||
            !queryParams[`fqid`]
        ) {
            throw new Error(`Parameters for http post had incorrect data`);
        }
        const [collection, id] = collectionIdFromFqid(queryParams[`fqid`] as string);
        return getHistory(collection, id, this.addDuplicates) as unknown as R;
    }
}

class MockUserRepo {
    public constructor() {}

    public getViewModel(id: Id): { id: Id; getFullName: () => string } {
        return {
            id,
            getFullName: () => `User ${id}`
        };
    }
}

function compareHistoryPositions(
    compare: HistoryPosition,
    to: any,
    fqid: string,
    isDeprecatedFormat: boolean
): boolean {
    return (
        compare.timestamp !== to.timestamp ||
        compare.fqid !== fqid ||
        compare.date.toJSON() !== new Date(to.timestamp * 1000).toJSON() ||
        compare.position !== to.position ||
        compare.user_id !== to.user_id ||
        compare.user !== `User ${to.user_id}` ||
        compare.getLocaleString(`en`) !== new Date(to.timestamp * 1000).toLocaleString(`en`) ||
        compare.information?.join(`#`) !==
            (isDeprecatedFormat
                ? (to.information as string[])
                : (to.information as { [fqid: string]: string[] })[fqid]
            )?.join(`#`)
    );
}

describe(`HistoryPresenterService`, () => {
    let service: HistoryPresenterService;
    let http: MockHttpService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HistoryPresenterService,
                { provide: HttpService, useClass: MockHttpService },
                { provide: UserControllerService, useClass: MockUserRepo }
            ]
        });

        service = TestBed.inject(HistoryPresenterService);
        http = TestBed.inject(HttpService) as unknown as MockHttpService;
    });

    for (const { collection, id, useDuplicates } of [
        { collection: Motion.COLLECTION, id: 1, useDuplicates: false },
        { collection: Motion.COLLECTION, id: 5, useDuplicates: true },
        { collection: Assignment.COLLECTION, id: 6, useDuplicates: false },
        { collection: Assignment.COLLECTION, id: 3, useDuplicates: true },
        { collection: User.COLLECTION, id: 4, useDuplicates: false },
        { collection: User.COLLECTION, id: 2, useDuplicates: true }
    ]) {
        const fqid = `${collection}/${id}`;
        const expectLength = collection === Motion.COLLECTION ? 3 : collection === User.COLLECTION ? 5 : 9;
        const deprecatedFormat = collection === Assignment.COLLECTION;
        it(`test with ${collection} and ${useDuplicates ? `` : `no `}duplicates${
            deprecatedFormat ? ` in deprecated format` : ``
        }`, async () => {
            http.addDuplicates = useDuplicates;
            const history = await service.call(fqid);
            expect(http.lastPosts.length).toBe(1);
            expect(http.lastPosts[0]).toEqual({
                path: `/system/autoupdate/history_information`,
                data: undefined,
                queryParams: { fqid }
            });
            expect(history.length).toEqual(expectLength);
            expect(history.map(val => val.timestamp)).toEqual(
                getMultiple(0, expectLength).map((_, index) => getTime(expectLength - index))
            );
            const differentFromExpected = (getHistory(collection, id, false)[fqid] as any[])
                .sort((a, b) => b.timestamp - a.timestamp)
                .some((value, index) => compareHistoryPositions(history[index], value, fqid, deprecatedFormat));
            expect(differentFromExpected).toBe(false);
        });
    }
});
