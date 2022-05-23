import { Component } from '@angular/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { firstValueFrom } from 'rxjs';
import { ORGANIZATION_ID } from 'src/app/domain/models/organizations/organization.constants';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewTheme } from 'src/app/site/pages/organization/pages/designs';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ThemeBuilderDialogService } from '../../../../modules/theme-builder-dialog/services/theme-builder-dialog.service';
import { ThemeControllerService } from '../../../../services/theme-controller.service';

@Component({
    selector: `os-theme-list`,
    templateUrl: `./theme-list.component.html`,
    styleUrls: [`./theme-list.component.scss`]
})
export class ThemeListComponent extends BaseListViewComponent<ViewTheme> {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `name`,
            width: `100%`
        },
        {
            prop: `colors`,
            minWidth: 120
        },
        {
            prop: `is_active`,
            width: this.singleButtonWidth
        }
    ];

    public constructor(
        public readonly repo: ThemeControllerService,
        private dialog: ThemeBuilderDialogService,
        private prompt: PromptService
    ) {
        super();
        super.setTitle(`Design`);
        this.canMultiSelect = true;
    }

    public async openThemeBuilderDialog(viewTheme?: ViewTheme): Promise<void> {
        const dialog = await this.dialog.open(viewTheme?.theme);
        const result = await firstValueFrom(dialog.afterClosed());
        if (result) {
            if (viewTheme) {
                await this.repo.update(result, viewTheme.id);
            } else {
                await this.repo.create(result);
            }
        }
    }

    public changeCurrentTheme(theme: ViewTheme): void {
        if (!this.isThemeUsed(theme)) {
            this.repo.changeCurrentTheme(theme);
        }
    }

    public async deleteTheme(theme: ViewTheme): Promise<void> {
        const promptDialogTitle = `Delete theme`;
        const subtitle = `Do you really want to delete this theme?`;
        if (await this.prompt.open(promptDialogTitle, subtitle)) {
            await this.repo.delete(theme.id);
        }
    }

    public isThemeUsed(theme: ViewTheme): boolean {
        return theme.theme_for_organization_id === ORGANIZATION_ID;
    }
}
