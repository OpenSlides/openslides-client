import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Component } from '@angular/core';

import { C4DialogModule } from '../../modules/c4-dialog';
import { ChessDialogModule } from '../../modules/chess-dialog';

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
    public readonly choosableModules: EasterEggModuleDescription[] = [C4DialogModule, ChessDialogModule];

    public selectedModule: ComponentPortal<any> | null = new ComponentPortal(C4DialogModule.getComponent());

    public selectModule(component: ComponentType<any>): void {
        this.selectedModule = new ComponentPortal(component);
    }
}
