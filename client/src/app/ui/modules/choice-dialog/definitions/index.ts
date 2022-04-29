import { Observable } from 'rxjs';
import { Displayable } from '../../../../domain/interfaces';
import { Selectable } from 'src/app/domain/interfaces/selectable';

interface ChoiceDialogResult {
    action: string | null;
    items: number | number[];
}

/**
 * undefined is returned, if the dialog is closed. If a choice is submitted,
 * it will be an array of numbers and optionally an action string for multichoice
 * dialogs
 */
export type ChoiceAnswer = undefined | ChoiceDialogResult;

export class ChoiceDialogConfig {
    public readonly title!: string;
    public readonly content?: string;
    public readonly choices?: Observable<Selectable[]> | Selectable[];
    public readonly actions?: string[];
    public readonly clearChoiceOption?: string;
    public readonly multiSelect?: boolean;
}
