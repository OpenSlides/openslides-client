import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContainerModule } from './modules/interaction-container/interaction-container.module';
import { ActionBarModule } from './modules/action-bar/action-bar.module';

const EXPORT_MODULES = [InteractionContainerModule, ActionBarModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, ...EXPORT_MODULES],
    exports: EXPORT_MODULES
})
export class InteractionModule {}
