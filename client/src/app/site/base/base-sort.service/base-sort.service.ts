import { Directive } from '@angular/core';
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
    public constructor(protected translate: TranslateService) {
        this.intl = new Intl.Collator(translate.currentLang, {
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
    protected sortItems(itemA: T, itemB: T, sortProperty: OsSortProperty<T>, ascending: boolean = true): number {
        const sortPropertyArray = Array.isArray(sortProperty) ? sortProperty : [sortProperty];
        const primaryProperty = sortPropertyArray[0];
        const result = this.sortItemsHelper(itemA, itemB, primaryProperty, ascending);
        return result === 0 && sortPropertyArray.length > 1
            ? this.sortItems(itemA, itemB, sortPropertyArray.slice(1), ascending)
            : result;
    }

    private sortItemsHelper(itemA: T, itemB: T, sortProperty: keyof T, ascending: boolean = true): number {
        const sortPropertyArray = Array.isArray(sortProperty) ? sortProperty : [sortProperty];
        // always sort falsy values to the bottom
        const property = sortProperty;
        if (this.isFalsy(itemA[property]) && this.isFalsy(itemB[property])) {
            return 0;
        } else if (this.isFalsy(itemA[property])) {
            return 1;
        } else if (this.isFalsy(itemB[property])) {
            return -1;
        }

        const firstProperty = ascending ? itemA[property] : (itemB[property] as any);
        const secondProperty = ascending ? itemB[property] : (itemA[property] as any);

        if (this.sortFn) {
            return this.sortFn(itemA, itemB, ascending, this.intl);
        } else {
            switch (typeof firstProperty) {
                case `boolean`:
                    if (!firstProperty && secondProperty) {
                        return -1;
                    } else {
                        return 1;
                    }
                case `number`:
                    return firstProperty > secondProperty ? 1 : -1;
                case `string`:
                    if (firstProperty && !secondProperty) {
                        return -1;
                    } else if (!firstProperty && !!secondProperty) {
                        return 1;
                    } else if ((!secondProperty && !secondProperty) || firstProperty === secondProperty) {
                        return 0;
                    } else {
                        return this.intl.compare(firstProperty, secondProperty as any);
                    }
                case `function`:
                    const a = firstProperty.bind(itemA)();
                    const b = secondProperty.bind(itemB)();
                    return this.intl.compare(a, b);
                case `object`:
                    if (firstProperty instanceof Date) {
                        return firstProperty > secondProperty ? 1 : -1;
                    } else {
                        return this.intl.compare(firstProperty.toString(), secondProperty.toString());
                    }
                case `undefined`:
                    return 1;
                default:
                    return -1;
            }
        }
    }
}
