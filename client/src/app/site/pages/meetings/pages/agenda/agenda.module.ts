import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaRoutingModule } from './agenda-routing.module';
import { AgendaMainComponent } from './components/agenda-main/agenda-main.component';
import { RouterModule } from '@angular/router';
import { AgendaItemCommonServiceModule } from './services/agenda-item-common-service.module';

@NgModule({
    declarations: [AgendaMainComponent],
    imports: [CommonModule, AgendaRoutingModule, AgendaItemCommonServiceModule, RouterModule]
})
export class AgendaModule {}
