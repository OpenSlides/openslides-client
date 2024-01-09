import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Displayable, Identifiable } from 'src/app/domain/interfaces';
import { FlatNode } from 'src/app/infrastructure/definitions/tree';
import { BaseSortService, OsSortProperty } from 'src/app/site/base/base-sort.service';

/**
 * Sorting service for trees.
 *
 * Contains base functions to sort a tree by different properties.
 */
@Injectable({
    providedIn: `root`
})
export class TreeSortService<T extends Identifiable & Displayable> extends BaseSortService<T> {
    /**
     * Function to sort the passed source of a tree
     * and resets some properties like `level`, `expandable`, `position`.
     *
     * @param sourceData The source array of `FlatNode`s.
     * @param property The property, the array will be sorted by.
     * @param ascending Boolean, if the array should be sorted in ascending order.
     *
     * @returns {FlatNode<T>[]} The sorted array.
     */
    public sortTree(sourceData: FlatNode<T>[], property: OsSortProperty<T>, ascending = true): FlatNode<T>[] {
        return sourceData
            .sort((nodeA, nodeB) => {
                const itemA = nodeA.item;
                const itemB = nodeB.item;
                return this.sortItems(itemA, itemB, property, ascending);
            })
            .map((node, index) => {
                node.level = 0;
                node.position = index;
                node.expandable = false;
                return node;
            });
    }
}
