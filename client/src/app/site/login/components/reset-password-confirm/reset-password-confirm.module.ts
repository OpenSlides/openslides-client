import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ResetPasswordConfirmComponent } from './reset-password-confirm.component';
import { ResetPasswordConfirmRoutingModule } from './reset-password-confirm-routing.module';

@NgModule({
    imports: [CommonModule, SharedModule, ResetPasswordConfirmRoutingModule],
    declarations: [ResetPasswordConfirmComponent]
})
export class ResetPasswordConfirmModule {}
