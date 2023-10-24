import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

import { EditorComponent } from './components/editor/editor.component';

const DECLARATIONS = [EditorComponent];

@NgModule({
    declarations: DECLARATIONS,
    imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatButtonToggleModule, MatIconModule],
    exports: DECLARATIONS
})
export class EditorModule {}
