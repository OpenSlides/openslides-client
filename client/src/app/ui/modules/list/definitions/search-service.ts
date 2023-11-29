import { Observable } from 'rxjs';
export interface SearchService<V> {
    readonly outputObservable: Observable<V[]>;
    initSearchService(source: Observable<V[]>): void;
    exitSearchService(): void;
    search(input: string): void;
}
