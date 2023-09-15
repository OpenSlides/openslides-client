import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

import { RoundedInputComponent } from './components/rounded-input/rounded-input.component';

const DECLARATIONS = [RoundedInputComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule]
})
export class InputModule {}
