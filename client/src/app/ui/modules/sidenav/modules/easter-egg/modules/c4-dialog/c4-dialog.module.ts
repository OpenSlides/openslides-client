import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
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
