import { Service } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from '@app/ui/base/base-dialog-service';

import { VotingPrivacyWarningDialogComponent } from '../components/voting-privacy-warning-dialog/voting-privacy-warning-dialog.component';

@Service()
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
