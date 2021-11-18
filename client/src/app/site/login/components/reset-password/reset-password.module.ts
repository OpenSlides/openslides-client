import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModule } from '../../../../shared/shared.module';
import { ResetPasswordComponent } from './reset-password.component';
import { ResetPasswordRoutingModule } from './reset-password-routing.module';

@NgModule({
    imports: [CommonModule, SharedModule, ResetPasswordRoutingModule],
    declarations: [ResetPasswordComponent]
})
export class ResetPasswordModule {}
