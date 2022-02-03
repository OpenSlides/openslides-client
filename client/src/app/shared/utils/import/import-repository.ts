import { Identifiable } from 'app/shared/models/base/identifiable';

export interface ImportRepository<T> {
    create(...entries: T[]): Promise<Identifiable[]>;
    getViewModelList(): T[];
    getVerboseName(plural?: boolean): string;
}
