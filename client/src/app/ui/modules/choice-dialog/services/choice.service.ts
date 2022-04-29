import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, Observable } from 'rxjs';
import { infoDialogSettings } from '../../../../infrastructure/utils/dialog-settings';
import { Displayable } from '../../../../domain/interfaces';
import { ChoiceDialogComponent } from '../components/choice-dialog/choice-dialog.component';
import { ChoiceAnswer, ChoiceDialogConfig } from '../definitions';
import { ChoiceDialogModule } from '../choice-dialog.module';

@Injectable({
    providedIn: ChoiceDialogModule
})
export class ChoiceService {
    public constructor(private dialog: MatDialog) {}

    /**
     * Opens the dialog. Returns the chosen value after the user accepts.
     */
    public async open(config: ChoiceDialogConfig): Promise<ChoiceAnswer>;
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
    public async open(
        title: string,
        choices?: Observable<Displayable[]> | Displayable[],
        multiSelect?: boolean,
        actions?: string[],
        clearChoiceOption?: string
    ): Promise<ChoiceAnswer>;
    public async open(
        titleOrConfig: string | ChoiceDialogConfig,
        choices?: Observable<Displayable[]> | Displayable[],
        multiSelect: boolean = false,
        actions?: string[],
        clearChoiceOption?: string
    ): Promise<ChoiceAnswer> {
        const data =
            typeof titleOrConfig !== `string`
                ? titleOrConfig
                : { title: titleOrConfig, choices, multiSelect, actions, clearChoiceOption };
        const dialogRef = this.dialog.open(ChoiceDialogComponent, {
            ...infoDialogSettings,
            data
        });
        return firstValueFrom(dialogRef.afterClosed());
    }
}
