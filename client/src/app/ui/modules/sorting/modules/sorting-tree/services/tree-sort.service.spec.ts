import { TestBed } from '@angular/core/testing';
import { Id } from 'src/app/domain/definitions/key-types';
import { Displayable, Identifiable } from 'src/app/domain/interfaces';

import { TreeSortService } from './tree-sort.service';

xdescribe(`TreeSortService`, () => {
    class TestIdentifiable implements Identifiable, Displayable {
        readonly id: Id;
        getTitle() {
            return `Title`;
        }

        getListTitle() {
            return `LTitle`;
        }
    }

    let service: TreeSortService<TestIdentifiable>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TreeSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
