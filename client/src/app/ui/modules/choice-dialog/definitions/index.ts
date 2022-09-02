import { Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces/selectable';

interface ChoiceDialogResult<R extends Selectable = Selectable> {
    /**
     * A string describing the choosed choice of the actions array.
     */
    action: string | null;
    /**
     * A list of the selected results. If `multiple` is false, use `firstId` to get the single result.
     */
    ids: Ids;
    /**
     * The first id in the list of ids.
     */
    firstId: Id;
    /**
     * A list of the selected underlying models.
     */
    items: R[];
    /**
     * The first item of the list of selected items.
     */
    firstItem: R;
}

/**
 * undefined is returned, if the dialog is closed. If a choice is submitted,
 * it will be an array of numbers and optionally an action string for multichoice
 * dialogs
 */
export type ChoiceAnswer<R extends Selectable = Selectable> = undefined | ChoiceDialogResult<R>;

export class ChoiceDialogConfig<D extends Selectable = Selectable> {
    public readonly title!: string;
    public readonly content?: string;
    public readonly choices?: Observable<D[]> | D[];
    public readonly actions?: string[];
    public readonly clearChoiceOption?: string;
    public readonly multiSelect?: boolean;
    public readonly sortFn?: (a: D, b: D) => number; //For cases when choices are given and the search selector should be sorted a certain way.
}
