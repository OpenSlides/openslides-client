import { Selectable } from '@app/domain/interfaces/selectable';

export interface OsOptionSelectionChanged<T = Selectable> {
    value: T;
    selected: boolean;
}
