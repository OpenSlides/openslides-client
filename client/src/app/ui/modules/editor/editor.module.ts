import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

import { EditorComponent } from './components/editor/editor.component';

const DECLARATIONS = [EditorComponent];

@NgModule({
    declarations: DECLARATIONS,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatRippleModule],
    exports: DECLARATIONS
})
export class EditorModule {}
