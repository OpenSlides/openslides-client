import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { PromptDialogModule, PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ChessDialogComponent } from './components/chess-dialog/chess-dialog.component';

@NgModule({
    declarations: [ChessDialogComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        OpenSlidesTranslationModule.forChild(),
        PromptDialogModule
    ],
    providers: [PromptService]
})
export class ChessDialogModule {
    public static readonly label = `Play chess`;
    public static getComponent(): typeof ChessDialogComponent {
        return ChessDialogComponent;
    }
}
