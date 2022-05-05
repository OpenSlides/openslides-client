import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountMainComponent } from './components/account-main/account-main.component';

@NgModule({
    declarations: [AccountMainComponent],
    imports: [CommonModule, AccountsRoutingModule]
})
export class AccountsModule {}
