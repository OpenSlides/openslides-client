import { inject, Service, TemplateRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { infoDialogSettings } from '@app/infrastructure/utils/dialog-settings';
import { PromptService } from '@app/ui/modules/prompt-dialog';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { ActiveMeetingIdService } from '../../../services/active-meeting-id.service';
import { MediafileDeleteDialogComponent } from '../components/mediafile-delete-dialog/mediafile-delete-dialog.component';
import { ViewMediafile } from '../view-models';
import { MediafileControllerService } from './mediafile-controller.service';

@Service()
export class MediafileCommonService {
    private get activeMeetingId(): number {
        return this.meetingIdService.meetingId!;
    }

    private meetingIdService = inject(ActiveMeetingIdService);
    private router = inject(Router);
    private repo = inject(MediafileControllerService);
    private promptService = inject(PromptService);
    private translate = inject(TranslateService);
    private dialog = inject(MatDialog);

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
        const dialogRef = this.dialog.open(MediafileDeleteDialogComponent, {
            width: `290px`,
            data: { file }
        });

        if (await firstValueFrom(dialogRef.afterClosed())) {
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

        const result = await firstValueFrom(dialogRef.afterClosed());
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
