import { Identifiable } from 'src/app/domain/interfaces';

export interface ImportRepository<T> {
    create(...entries: T[]): Promise<Identifiable[]>;
    getViewModelList(): T[];
    getVerboseName(plural?: boolean): string;
}
