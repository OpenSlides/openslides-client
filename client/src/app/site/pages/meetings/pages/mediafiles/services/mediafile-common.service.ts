import { Injectable, TemplateRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, firstValueFrom } from 'rxjs';
import { infoDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ActiveMeetingIdService } from '../../../services/active-meeting-id.service';
import { ViewMediafile } from '../view-models';
import { MediafileCommonServiceModule } from './mediafile-common-service.module';
import { MediafileControllerService } from './mediafile-controller.service';

@Injectable({ providedIn: MediafileCommonServiceModule })
export class MediafileCommonService {
    private get activeMeetingId(): number {
        return this.meetingIdService.meetingId!;
    }

    constructor(
        private meetingIdService: ActiveMeetingIdService,
        private router: Router,
        private repo: MediafileControllerService,
        private promptService: PromptService,
        private translate: TranslateService,
        private dialog: MatDialog
    ) {}

    /**
     * Given a directory will navigate to the directories page, if no directory is given it will navigate to the base folder.
     * @param directory the current directory.
     * @param setDirectoryChainFn a function that receives the target directories directory chain as a value, will be called directly before navigation
     */
    public navigateToDirectoryPage(
        directory: ViewMediafile | null,
        setDirectoryChainFn?: (directoryChain: ViewMediafile[]) => void,
        prefix = false
    ): void {
        let navCmds: any[] = [...(this.activeMeetingId ? [this.activeMeetingId] : []), `mediafiles`];
        if (prefix) {
            navCmds = [`/`].concat(navCmds);
        }
        if (directory) {
            navCmds.push(directory.id);
        }
        if (setDirectoryChainFn) {
            setDirectoryChainFn(directory ? directory.getDirectoryChain() : []);
        }
        this.router.navigate(navCmds);
    }

    public navigateToUploadPage(directoryId?: number): void {
        const navigationCommands: any[] = [
            `/`,
            ...(this.activeMeetingId ? [this.activeMeetingId] : []),
            `mediafiles`,
            `upload`
        ];
        if (directoryId) {
            navigationCommands.push(directoryId);
        }
        this.router.navigate(navigationCommands);
    }

    public async handleDeleteFile(
        file: ViewMediafile,
        changeDirectoryFn: (directoryId: number) => void
    ): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this file?`);
        const content = file.getTitle();
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(file);
            if (file.is_directory) {
                changeDirectoryFn(file.parent_id);
            }
        }
    }

    public async handleDeleteSelected(files: ViewMediafile[], deselectAllFn: () => void): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete all selected files and folders?`);
        if (await this.promptService.open(title)) {
            await this.repo.delete(...files);
            deselectAllFn();
        }
    }

    public async handleCreateNewFolder(
        newDirectoryForm: UntypedFormGroup,
        currentDirectory: ViewMediafile,
        templateRef: TemplateRef<string>
    ): Promise<any> {
        newDirectoryForm.reset();
        const dialogRef = this.dialog.open(templateRef, infoDialogSettings);

        const result = await firstValueFrom(dialogRef.afterClosed().pipe(filter(result => result)));
        if (result) {
            const mediafile = {
                ...newDirectoryForm.value,
                parent_id: currentDirectory ? currentDirectory.id : null,
                is_directory: true
            };
            return this.repo.createDirectory(mediafile);
        }
    }
}
