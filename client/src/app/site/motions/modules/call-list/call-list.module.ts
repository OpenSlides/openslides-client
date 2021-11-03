import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { CallListComponent } from './call-list.component';
import { CallListRoutingModule } from './call-list-routing.module';

@NgModule({
    declarations: [CallListComponent],
    imports: [CommonModule, CallListRoutingModule, SharedModule]
})
export class CallListModule {}
