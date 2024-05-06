import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { VotingCryptographyInfoDialogComponent } from '../components/voting-cryptography-info-dialog/voting-cryptography-info-dialog.component';
import { VotingCryptographyInfoDialogModule } from '../voting-cryptography-info-dialog.module';

@Injectable({
    providedIn: VotingCryptographyInfoDialogModule
})
export class VotingCryptographyInfoDialogService extends BaseDialogService<
    VotingCryptographyInfoDialogComponent,
    ViewPoll,
    null
> {
    public async open(data: ViewPoll): Promise<MatDialogRef<VotingCryptographyInfoDialogComponent, null>> {
        const module = await import(`../voting-cryptography-info-dialog.module`).then(
            m => m.VotingCryptographyInfoDialogModule
        );
        return this.dialog.open(module.getComponent(), { data, ...infoDialogSettings });
    }
}
