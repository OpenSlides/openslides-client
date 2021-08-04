import { NgModule } from '@angular/core';

import { SharedModule } from 'app/shared/shared.module';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

@NgModule({
    declarations: [MainComponent],
    imports: [MainRoutingModule, SharedModule],
    exports: []
})
export class MainModule {}
