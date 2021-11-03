import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { MainComponent } from './main.component';
import { MainRoutingModule } from './main-routing.module';

@NgModule({
    declarations: [MainComponent],
    imports: [MainRoutingModule, SharedModule],
    exports: []
})
export class MainModule {}
