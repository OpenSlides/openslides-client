import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointOfOrderDialogComponent } from './components/point-of-order-dialog/point-of-order-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
    declarations: [PointOfOrderDialogComponent],
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        ReactiveFormsModule,
        OpenSlidesTranslationModule.forChild()
    ]
})
export class PointOfOrderDialogModule {
    public static getComponent(): typeof PointOfOrderDialogComponent {
        return PointOfOrderDialogComponent;
    }
}
