import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { C4DialogComponent } from './components/c4-dialog/c4-dialog.component';

@NgModule({
    declarations: [C4DialogComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, OpenSlidesTranslationModule.forChild()]
})
export class C4DialogModule {
    public static readonly label = `Play "Collect 4"`;
    public static getComponent(): typeof C4DialogComponent {
        return C4DialogComponent;
    }
}
