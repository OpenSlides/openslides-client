import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { firstValueFrom, Observable } from 'rxjs';
import { Selectable } from 'src/app/domain/interfaces';

import { infoDialogSettings } from '../../../../infrastructure/utils/dialog-settings';
import { ChoiceDialogModule } from '../choice-dialog.module';
import { ChoiceDialogComponent } from '../components/choice-dialog/choice-dialog.component';
import { ChoiceAnswer, ChoiceDialogConfig } from '../definitions';

@Injectable({
    providedIn: ChoiceDialogModule
})
export class ChoiceService {
    public constructor(private dialog: MatDialog) {}

    /**
     * Opens the dialog. Returns the chosen value after the user accepts.
     */
    public async open<T extends Selectable = Selectable>(config: ChoiceDialogConfig<T>): Promise<ChoiceAnswer<T>>;
    /**
     * @deprecated This signature is deprecated and will be removed in the next version. Instead, pass an object.
     * @param title The title to display in the dialog
     * @param choices The available choices
     * @param multiSelect turn on the option to select multiple entries.
     *  The answer.items will then be an array.
     * @param actions optional strings for buttons replacing the regular confirmation.
     * The answer.action will reflect the button selected
     * @param clearChoiceOption A string for an extra, visually slightly separated
     * choice for 'explicitly set an empty selection'. The answer's action may
     * have this string's value
     * @returns an answer {@link ChoiceAnswer}
     */
    public async open<T extends Selectable = Selectable>(
        title: string,
        choices?: Observable<T[]> | T[],
        multiSelect?: boolean,
        actions?: string[],
        clearChoiceOption?: string,
        sortFn?: (a: T, b: T) => number
    ): Promise<ChoiceAnswer<T>>;
    public async open<T extends Selectable = Selectable>(
        titleOrConfig: string | ChoiceDialogConfig,
        choices?: Observable<T[]> | T[],
        multiSelect = false,
        actions?: string[],
        clearChoiceOption?: string,
        sortFn?: (a: T, b: T) => number
    ): Promise<ChoiceAnswer<T>> {
        const data =
            typeof titleOrConfig !== `string`
                ? titleOrConfig
                : { title: titleOrConfig, choices, multiSelect, actions, clearChoiceOption, sortFn };
        const dialogRef = this.dialog.open(ChoiceDialogComponent, {
            ...infoDialogSettings,
            data
        });
        return firstValueFrom(dialogRef.afterClosed());
    }
}
