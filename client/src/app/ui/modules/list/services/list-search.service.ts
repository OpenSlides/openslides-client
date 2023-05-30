import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Identifiable } from 'src/app/domain/interfaces';

import { SearchService } from '../definitions/search-service';

export class ListSearchService<V extends Identifiable> implements SearchService<V> {
    public get outputObservable(): Observable<V[]> {
        return this._outputSubject.asObservable();
    }

    private _source: V[] = [];
    private _sourceObservable: Observable<V[]> | null = null;
    private _sourceSubscription: Subscription | null = null;
    private _currentSearchFilter: string = ``;
    private _filterPropsMap: { [filterProps: string]: string[] } = {};

    private readonly _outputSubject = new BehaviorSubject<V[]>([]);

    public constructor(private readonly filterProps: string[], private readonly alsoFilterByProperties: string[]) {
        this._filterPropsMap = filterProps.mapToObject(prop => ({ [prop]: prop.split(`.`) }));
    }

    public initSearchService(source: Observable<V[]>): void {
        this._sourceObservable = source;
        this.refreshSubscription();
    }

    public search(input: string): void {
        this._currentSearchFilter = input?.toLowerCase();
        this.filter();
    }

    private refreshSearch(): void {
        this.filter();
    }

    private refreshSubscription(): void {
        if (this._sourceSubscription) {
            this._sourceSubscription.unsubscribe();
            this._sourceSubscription = null;
        }
        if (this._sourceObservable) {
            this._sourceSubscription = this._sourceObservable.subscribe(items => {
                this._source = items;
                this.refreshSearch();
            });
        }
    }

    private filter(): void {
        if (!this.filterProps?.length) {
            console.warn(`No filter props are given`);
            this._outputSubject.next(this._source);
            return;
        }
        const trimmedInput = this._currentSearchFilter?.trim();
        const nextOutput = this._source.filter(item => {
            if (!trimmedInput) {
                return true;
            }

            if (this.isIncludedInProperty(item, trimmedInput, this.alsoFilterByProperties)) {
                return true;
            }

            // custom filter predicates
            return this.filterProps.some(prop => !this.isFiltered(item, this._filterPropsMap[prop], trimmedInput));
        });
        this._outputSubject.next(nextOutput);
    }

    /**
     * A recursive function that searches for the first property name in a given array,
     * that is included in a given object and then returns true, if the value of said property includes a given trimmed input string.
     *
     * @param item the object whose properties should be checked
     * @param trimmedInput the string whose inclusion in the property value should be checked
     * @param properties an array of property names
     * @returns true if the trimmedInput is included in the chosen property value
     */
    private isIncludedInProperty(item: V, trimmedInput: string, properties: string[]): boolean {
        if (properties.length > 0 && !!item[properties[0]]) {
            const propertyValueString = `` + item[properties[0]];
            const foundPropertyValue = propertyValueString.trim().toLowerCase().indexOf(trimmedInput) !== -1;
            if (foundPropertyValue) {
                return true;
            }
            return false;
        }
        if (properties.length > 1) {
            return this.isIncludedInProperty(item, trimmedInput, properties.slice(1));
        }
        return false;
    }

    private isFiltered(originItem: V, splittedProp: string[], trimmedInput: string): boolean {
        const splittedPropsCopy = [...splittedProp];
        let property: unknown;
        let model: unknown = originItem;
        if (!originItem) {
            return true;
        }
        do {
            const subProp = splittedPropsCopy.shift();
            property = (model as any)[subProp!];
            model = property;
        } while (!!property && !!splittedPropsCopy.length);
        if (!property) {
            return true;
        }

        let propertyAsString = ``;
        // If the property is a function, call it.
        if (typeof property === `function`) {
            propertyAsString = String(property.bind(originItem)());
        } else if (Array.isArray(property) || (property as any).constructor === Array) {
            propertyAsString = (property as any).join(``);
        } else {
            propertyAsString = String(property);
        }

        if (propertyAsString) {
            const foundProp = propertyAsString.trim().toLowerCase().indexOf(trimmedInput) !== -1;

            if (foundProp) {
                return false;
            }
        }
        return true;
    }
}
