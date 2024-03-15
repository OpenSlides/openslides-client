import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Displayable, Identifiable } from 'src/app/domain/interfaces';
import { FlatNode, isFlatNode } from 'src/app/infrastructure/definitions/tree';
import { MockTranslateService } from 'src/app/site/pages/meetings/modules/poll/pipes/poll-parse-number/poll-parse-number.pipe.spec';

import { TreeService } from './tree.service';
import { TreeSortService } from './tree-sort.service';

describe(`TreeSortService`, () => {
    class TestIdentifiable implements Identifiable, Displayable {
        public readonly id: Id;

        public constructor(
            id: Id,
            public parent_id: number,
            public boolean: boolean,
            public number: number,
            public string: string,
            public func: () => string,
            public date: Date
        ) {
            this.id = id;
        }

        public getTitle() {
            return `Title`;
        }

        public getListTitle() {
            return `LTitle`;
        }
    }

    const treeService = new TreeService();
    let sourceData: FlatNode<TestIdentifiable>[];

    let service: TreeSortService<TestIdentifiable>;

    const expectedAscOrder = {
        id: [1, 2, 3, 4, 5],
        parent_id: [5, 3, 1, 2, 4],
        boolean: [2, 4, 1, 3, 5],
        number: [3, 1, 5, 4, 2],
        string: [1, 5, 4, 3, 2],
        func: [5, 4, 1, 3, 2],
        date: [4, 3, 1, 2, 5]
    };

    const expectedDscOrder = {
        ...Object.entries(expectedAscOrder).mapToObject(([key, arr]) => ({ [key]: [...arr].reverse() })),
        parent_id: [1, 2, 4, 3, 5]
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TranslateService, { provide: TranslateService, useClass: MockTranslateService }]
        });
        service = TestBed.inject(TreeSortService);
        sourceData = treeService
            .makeFlatTree(
                [
                    new TestIdentifiable(1, undefined, true, 4, `a string`, () => `function one`, new Date(123456789)),
                    new TestIdentifiable(
                        2,
                        undefined,
                        false,
                        123,
                        `two strings`,
                        () => `function two`,
                        new Date(987654321)
                    ),
                    new TestIdentifiable(3, 2, true, 2, `three strings`, () => `function three`, new Date(98765432)),
                    new TestIdentifiable(
                        4,
                        undefined,
                        false,
                        65,
                        `four strings`,
                        () => `function four`,
                        new Date(13579)
                    ),
                    new TestIdentifiable(5, 1, true, 4, `five strings`, () => `function five`, new Date(999999999))
                ],
                `id`,
                `parent_id`
            )
            .sort((a, b) => a.id - b.id);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });

    for (const testCase of Object.entries({ ascending: expectedAscOrder, descending: expectedDscOrder })) {
        const mode = testCase[0];
        const order = testCase[1];
        for (const key of Object.keys(order)) {
            if (order[key]) {
                it(`test sortTree by ${key} in ${mode} order`, () => {
                    const sorted = service.sortTree(sourceData, key as keyof TestIdentifiable, mode === `ascending`);
                    expect(sorted.length).toBe(5);
                    expect(sorted.every(node => isFlatNode(node))).toBe(true);
                    for (const [index, id] of order[key].entries()) {
                        expect(sorted[index].id).toBe(id);
                    }
                });
            }
        }
    }
});
