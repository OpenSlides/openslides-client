import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';

import { C4DialogModule } from '../../modules/c4-dialog/c4-dialog.module';

interface EasterEggModuleDescription {
    label: string;
    getComponent: () => ComponentType<any>;
}

@Component({
    selector: `os-easter-egg-content-platform-dialog`,
    templateUrl: `./easter-egg-content-platform-dialog.component.html`,
    styleUrls: [`./easter-egg-content-platform-dialog.component.scss`]
})
export class EasterEggContentPlatformDialogComponent {
    public readonly choosableModules: EasterEggModuleDescription[] = [C4DialogModule];

    public selectedModule: ComponentPortal<any> | null = new ComponentPortal(C4DialogModule.getComponent());

    public selectModule(component: ComponentType<any>): void {
        console.log(`selectedModule`, component);
        this.selectedModule = new ComponentPortal(component);
    }
}
