import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NotifyResponse, NotifyService } from '@app/gateways/notify.service';
import { mediumDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { TranslateService } from '@ngx-translate/core';

import { ChessDialogModule } from '../chess-dialog.module';

@Injectable({
    providedIn: 'root'
})
export class ChessChallengeService {
    private notifyService = inject(NotifyService);
    private dialog = inject(MatDialog);
    private translate = inject(TranslateService);
    private prompt = inject(PromptService);

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
