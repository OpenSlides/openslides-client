import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TranslateService } from '@ngx-translate/core';
import { NotifyResponse, NotifyService } from 'src/app/gateways/notify.service';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ChessDialogModule } from '../chess-dialog.module';

@Injectable({
    providedIn: ChessDialogModule
})
export class ChessChallengeService {
    public constructor(
        private notifyService: NotifyService,
        private op: OperatorService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private prompt: PromptService
    ) {}

    public startListening(): void {
        this.notifyService
            .getMessageObservable(`chess_challenge`)
            .subscribe(async (notify: NotifyResponse<{ name: string }>) => {
                if (!notify.sendByThisUser) {
                    const title =
                        notify.message.name + ` ` + this.translate.instant(`challenged you to a chess match!`);
                    const content = this.translate.instant(`Do you accept?`);
                    if (await this.prompt.open(title, content)) {
                        this.dialog.open(ChessDialogModule.getComponent(), {
                            ...mediumDialogSettings,
                            data: { notify }
                        });
                    }
                }
            });
    }
}
