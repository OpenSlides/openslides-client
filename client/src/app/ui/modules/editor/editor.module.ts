import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OpenSlidesTranslationModule } from 'src/app/site/modules/translations';

import { EditorComponent } from './components/editor/editor.component';
import { EditorHtmlDialogComponent } from './components/editor-html-dialog/editor-html-dialog.component';
import { EditorImageDialogComponent } from './components/editor-image-dialog/editor-image-dialog.component';
import { EditorLinkDialogComponent } from './components/editor-link-dialog/editor-link-dialog.component';

const DECLARATIONS = [
    EditorComponent,
    EditorImageDialogComponent,
    EditorLinkDialogComponent,
    EditorHtmlDialogComponent
];

@NgModule({
    declarations: DECLARATIONS,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatRippleModule,
        MatFormFieldModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        MatMenuModule,
        MatTooltipModule,
        FormsModule,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: DECLARATIONS
})
export class EditorModule {}
