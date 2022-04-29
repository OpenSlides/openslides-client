import { NgModule } from '@angular/core';
import { C4DialogComponent } from './components/c4-dialog/c4-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [C4DialogComponent],
    imports: [CommonModule, MatButtonModule, MatDialogModule, OpenSlidesTranslationModule.forChild()]
})
export class C4DialogModule {
    public static readonly label = `Play "Collect 4"`;
    public static getComponent(): typeof C4DialogComponent {
        return C4DialogComponent;
    }
}
