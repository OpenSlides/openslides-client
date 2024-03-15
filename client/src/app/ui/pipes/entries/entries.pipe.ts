import { KeyValue } from '@angular/common';
import { KeyValueDiffer, KeyValueDiffers, Pipe, PipeTransform } from '@angular/core';

interface IterableMap<K, V> {
    [Symbol.iterator](): IterableIterator<[K, V]>;
}

@Pipe({
    name: `entries`
})
export class EntriesPipe implements PipeTransform {
    private differ!: KeyValueDiffer<any, any>;
    private keyValues: Array<KeyValue<any, any>> = [];
    private compareFn: (a: KeyValue<any, any>, b: KeyValue<any, any>) => number = DefaultCompareFn;

    public constructor(private readonly differs: KeyValueDiffers) {}

    public transform<K, V>(
        instance: IterableMap<K, V> | any,
        compareFn?: (a: KeyValue<K, V>, b: KeyValue<K, V>) => number
    ): Array<KeyValue<K, V>> {
        if (!this.differ) {
            this.differ = this.differs.find(instance).create();
        }

        const differChanges = this.differ.diff(instance);
        const compareFnChanged = compareFn !== this.compareFn;

        if (differChanges) {
            this.keyValues = [];
            differChanges.forEachItem(record => {
                this.keyValues.push({ key: record.key, value: record.currentValue });
            });
        }
        if (differChanges || compareFnChanged) {
            this.keyValues.sort(compareFn);
            this.compareFn = compareFn!;
        }
        return this.keyValues;
    }
}

const DefaultCompareFn = <K, V>(a: KeyValue<K, V>, b: KeyValue<K, V>) => {
    if (a === b) {
        return 0;
    }
    if (a === null || a === undefined) {
        return 1;
    }
    if (b === null || b === undefined) {
        return -1;
    }
    if (typeof a === `string` && typeof b === `string`) {
        return a < b ? -1 : 1;
    }
    if (typeof a === `boolean` && typeof b === `boolean`) {
        return a < b ? -1 : 1;
    }
    if (typeof a === `number` && typeof b === `number`) {
        return a - b;
    }
    const aStringValue = String(a);
    const bStringValue = String(b);
    if (aStringValue === bStringValue) {
        return 0;
    } else {
        return aStringValue < bStringValue ? -1 : 1;
    }
};
