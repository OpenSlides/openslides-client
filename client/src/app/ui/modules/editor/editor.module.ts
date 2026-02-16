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
import { MotionEditorComponent } from 'src/app/site/pages/meetings/pages/motions/components/motion-editor/motion-editor.component';

import { EditorComponent } from './components/editor/editor.component';
import { EditorEmbedDialogComponent } from './components/editor-embed-dialog/editor-embed-dialog.component';
import { EditorHtmlDialogComponent } from './components/editor-html-dialog/editor-html-dialog.component';
import { EditorImageDialogComponent } from './components/editor-image-dialog/editor-image-dialog.component';
import { EditorLinkDialogComponent } from './components/editor-link-dialog/editor-link-dialog.component';
import { EditorTabNavigationDirective } from './directives/tab-navigation.directive';

const DECLARATIONS = [
    EditorComponent,
    EditorImageDialogComponent,
    EditorEmbedDialogComponent,
    EditorLinkDialogComponent,
    EditorHtmlDialogComponent,
    MotionEditorComponent
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
        EditorTabNavigationDirective,
        OpenSlidesTranslationModule.forChild()
    ],
    exports: DECLARATIONS
})
export class EditorModule {}
