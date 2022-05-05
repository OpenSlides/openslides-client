import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundedInputComponent } from './components/rounded-input/rounded-input.component';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

const DECLARATIONS = [RoundedInputComponent];

@NgModule({
    declarations: DECLARATIONS,
    exports: DECLARATIONS,
    imports: [CommonModule, MatIconModule, ReactiveFormsModule]
})
export class InputModule {}
