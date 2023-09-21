import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { ChessDialogComponent } from './components/chess-dialog/chess-dialog.component';

@NgModule({
    declarations: [ChessDialogComponent],
    imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, OpenSlidesTranslationModule.forChild()]
})
export class ChessDialogModule {
    public static readonly label = `Play chess`;
    public static getComponent(): typeof ChessDialogComponent {
        return ChessDialogComponent;
    }
}
