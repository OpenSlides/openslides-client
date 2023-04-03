import { Component } from '@angular/core';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions } from '@angular/material/checkbox';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewTheme } from 'src/app/site/pages/organization/pages/designs';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ThemeBuilderDialogService } from '../../../../modules/theme-builder-dialog/services/theme-builder-dialog.service';
import { ThemeControllerService } from '../../../../services/theme-controller.service';

@Component({
    selector: `os-theme-list`,
    templateUrl: `./theme-list.component.html`,
    styleUrls: [`./theme-list.component.scss`],
    providers: [
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: `noop` } as MatCheckboxDefaultOptions }
    ]
})
export class ThemeListComponent extends BaseListViewComponent<ViewTheme> {
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public readonly repo: ThemeControllerService,
        private dialog: ThemeBuilderDialogService,
        private prompt: PromptService
    ) {
        super(componentServiceCollector, translate);
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

    public async changeCurrentTheme(theme: ViewTheme): Promise<void> {
        const title = `Are you sure you want to activate this design?`;
        const content = `This will change the design in all committees.`;
        if (!this.isThemeUsed(theme)) {
            if (await this.prompt.open(title, content)) {
                this.repo.changeCurrentTheme(theme);
            }
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
