import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { EasterEggContentPlatformDialogComponent } from '../components/easter-egg-content-platform-dialog/easter-egg-content-platform-dialog.component';
import { EasterEggModule } from '../easter-egg.module';

@Injectable({
    providedIn: EasterEggModule
})
export class EasterEggContentPlatformService extends BaseDialogService<
    EasterEggContentPlatformDialogComponent,
    void,
    void
> {
    public async open(): Promise<MatDialogRef<EasterEggContentPlatformDialogComponent, void>> {
        const module = await import(`../easter-egg.module`).then(m => m.EasterEggModule);
        return this.dialog.open(module.getContentPlatform(), { ...mediumDialogSettings, disableClose: true });
    }
}
