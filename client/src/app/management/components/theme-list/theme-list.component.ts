import { Component } from '@angular/core';
import { ViewTheme } from 'app/management/models/view-theme';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { PblColumnDefinition } from '@pebula/ngrid';
import { ComponentServiceCollector } from '../../../core/ui-services/component-service-collector';
import { ThemeRepositoryService } from '../../../core/repositories/themes/theme-repository.service';
import { SimplifiedModelRequest } from '../../../core/core-services/model-request-builder.service';
import { ViewOrganization } from '../../models/view-organization';
import { ORGANIZATION_ID } from '../../../core/core-services/organization.service';
import { MatDialog } from '@angular/material/dialog';
import { ThemeBuilderDialogComponent } from '../theme-builder-dialog/theme-builder-dialog.component';
import { mediumDialogSettings } from '../../../shared/utils/dialog-settings';
import { OrganizationRepositoryService } from '../../../core/repositories/management/organization-repository.service';
import { PromptService } from '../../../core/ui-services/prompt.service';

@Component({
    selector: 'os-theme-list',
    templateUrl: './theme-list.component.html',
    styleUrls: ['./theme-list.component.scss']
})
export class ThemeListComponent extends BaseListViewComponent<ViewTheme> {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'name',
            width: '100%'
        },
        {
            prop: 'colors',
            minWidth: 120
        },
        {
            prop: 'is_active',
            width: this.singleButtonWidth
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        public readonly repo: ThemeRepositoryService,
        private dialogService: MatDialog,
        private orgaRepo: OrganizationRepositoryService,
        private prompt: PromptService
    ) {
        super(componentServiceCollector);
        super.setTitle('Design');
        this.canMultiSelect = true;
    }

    public async openThemeBuilderDialog(viewTheme?: ViewTheme): Promise<void> {
        const dialog = this.dialogService.open(ThemeBuilderDialogComponent, {
            ...mediumDialogSettings,
            data: viewTheme?.theme
        });
        const result = await dialog.afterClosed().toPromise();
        if (result) {
            if (viewTheme) {
                await this.repo.update(result, viewTheme.id);
            } else {
                await this.repo.create(result);
            }
        }
    }

    public changeCurrentTheme(theme: ViewTheme): void {
        if (this.isThemeUsed(theme)) {
            return;
        }
        this.orgaRepo.update({ theme_id: theme.id });
    }

    public async deleteTheme(theme: ViewTheme): Promise<void> {
        const promptDialogTitle = 'Delete theme';
        const subtitle = 'Do you really want to delete this theme?';
        if (await this.prompt.open(promptDialogTitle, subtitle)) {
            await this.repo.delete(theme.id);
        }
    }

    public isThemeUsed(theme: ViewTheme): boolean {
        return theme.theme_for_organization_id === ORGANIZATION_ID;
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [ORGANIZATION_ID],
            fieldset: '',
            follow: [{ idField: 'theme_ids' }]
        };
    }
}
