import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { EditorModule as TinyMce, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

import { EditorComponent } from './components/editor/editor.component';

const DECLARATIONS = [EditorComponent];

@NgModule({
    declarations: DECLARATIONS,
    imports: [CommonModule, TinyMce, ReactiveFormsModule],
    exports: DECLARATIONS,
    providers: [
        {
            provide: TINYMCE_SCRIPT_SRC,
            useValue: `tinymce/tinymce.min.js`
        }
    ]
})
export class EditorModule {}
