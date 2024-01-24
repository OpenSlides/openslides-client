import { Directive, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Displayable, Identifiable } from 'src/app/domain/interfaces';
import { SortService } from 'src/app/ui/modules/list/definitions/sort-service';

import { OsSortProperty } from './os-sort';
/**
 * Base sorting service with main functionality for sorting.
 *
 * Extends sorting services to sort with a consistent function.
 */
@Directive()
export abstract class BaseSortService<T extends Identifiable & Displayable> implements SortService<T> {
    /**
     * The sorting function according to current settings.
     */
    public sortFn?: (a: T, b: T, ascending: boolean, intl?: Intl.Collator) => number;

    /**
     * The international localisation.
     */
    protected intl: Intl.Collator;

    /**
     * Constructor.
     * Pass the `TranslatorService`.
     */
    protected translate = inject(TranslateService);

    public constructor() {
        this.intl = new Intl.Collator(this.translate.currentLang, {
            numeric: true,
            ignorePunctuation: true,
            sensitivity: `base`
        });
    }

    /**
     * Helper function to determine false-like values (if they are not boolean)
     * @param property
     */
    private isFalsy(property: any): boolean {
        return property === null || property === undefined || property === ``;
    }

    /**
     * Recreates the sorting function. Is supposed to be called on init and
     * every time the sorting (property, ascending/descending) or the language changes
     */
    protected sortItems(itemA: T, itemB: T, sortProperty: OsSortProperty<T>, ascending = true): number {
        const sortPropertyArray = Array.isArray(sortProperty) ? sortProperty : [sortProperty];
        const primaryProperty = sortPropertyArray[0];
        const result = (ascending ? 1 : -1) * this.sortItemsHelper(itemA, itemB, primaryProperty);
        return result === 0 && sortPropertyArray.length > 1
            ? this.sortItems(itemA, itemB, sortPropertyArray.slice(1), ascending)
            : result;
    }

    private sortItemsHelper(itemA: T, itemB: T, sortProperty: keyof T): number {
        const propertyA = itemA[sortProperty];
        const propertyB = itemB[sortProperty];

        // always sort falsy values to the bottom
        if (this.isFalsy(propertyA) && this.isFalsy(propertyB)) {
            return 0;
        } else if (this.isFalsy(propertyA)) {
            return 1;
        } else if (this.isFalsy(propertyB)) {
            return -1;
        }

        if (this.sortFn) {
            // set ascending to true because the ascension is applied in the sortItems function
            return this.sortFn(itemA, itemB, true, this.intl);
        } else {
            switch (typeof propertyA) {
                case `boolean`:
                    if (!propertyA && propertyB) {
                        return -1;
                    } else {
                        return 1;
                    }
                case `number`:
                    return propertyA > propertyB ? 1 : -1;
                case `string`:
                    if (propertyA && !propertyB) {
                        return -1;
                    } else if (!propertyA && !!propertyB) {
                        return 1;
                    } else if ((!propertyB && !propertyB) || propertyA === propertyB) {
                        return 0;
                    } else {
                        return this.intl.compare(propertyA, propertyB as any);
                    }
                case `function`:
                    const a = propertyA.bind(itemA)();
                    const b = (propertyB as unknown as () => any).bind(itemB)();
                    return this.intl.compare(a, b);
                case `object`:
                    if (propertyA instanceof Date) {
                        return propertyA > propertyB ? 1 : -1;
                    } else {
                        return this.intl.compare(propertyA.toString(), propertyB.toString());
                    }
                case `undefined`:
                    return 1;
                default:
                    return -1;
            }
        }
    }
}
