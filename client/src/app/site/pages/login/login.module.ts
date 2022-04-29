import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginWrapperModule } from './modules/login-wrapper/login-wrapper.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, LoginRoutingModule, LoginWrapperModule]
})
export class LoginModule {}
