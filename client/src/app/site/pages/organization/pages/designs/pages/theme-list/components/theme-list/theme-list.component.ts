import { Component, inject } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewTheme } from 'src/app/site/pages/organization/pages/designs';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ThemeBuilderDialogService } from '../../../../modules/theme-builder-dialog/services/theme-builder-dialog.service';
import { ThemeControllerService } from '../../../../services/theme-controller.service';

@Component({
    selector: `os-theme-list`,
    templateUrl: `./theme-list.component.html`,
    styleUrls: [`./theme-list.component.scss`]
})
export class ThemeListComponent extends BaseListViewComponent<ViewTheme> {
    protected override translate = inject(TranslateService);
    public readonly repo = inject(ThemeControllerService);
    private dialog = inject(ThemeBuilderDialogService);
    public prompt = inject(PromptService);

    public constructor() {
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

    public async changeCurrentTheme(confirmed: boolean, theme: ViewTheme): Promise<void> {
        if (confirmed) {
            this.repo.changeCurrentTheme(theme);
        }
    }

    public async deleteTheme(theme: ViewTheme): Promise<void> {
        const promptDialogTitle = _(`Delete color set`);
        const subtitle = _(`Do you really want to delete this color set?`);
        if (await this.prompt.open(promptDialogTitle, subtitle)) {
            await this.repo.delete(theme.id);
        }
    }

    public isThemeUsed(theme: ViewTheme): boolean {
        return theme.theme_for_organization_id === ORGANIZATION_ID;
    }
}
