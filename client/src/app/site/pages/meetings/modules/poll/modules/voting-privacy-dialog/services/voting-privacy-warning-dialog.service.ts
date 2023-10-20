import { Injectable } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { VotingPrivacyWarningDialogComponent } from '../components/voting-privacy-warning-dialog/voting-privacy-warning-dialog.component';
import { VotingPrivacyDialogModule } from '../voting-privacy-dialog.module';

@Injectable({
    providedIn: VotingPrivacyDialogModule
})
export class VotingPrivacyWarningDialogService extends BaseDialogService<
    VotingPrivacyWarningDialogComponent,
    void,
    null
> {
    public async open(): Promise<MatDialogRef<VotingPrivacyWarningDialogComponent, null>> {
        const module = await import(`../voting-privacy-dialog.module`).then(m => m.VotingPrivacyDialogModule);
        return this.dialog.open(module.getComponent(), infoDialogSettings);
    }
}
