import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ColorService } from 'src/app/site/services/color.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { OrganizationTagDialogService } from '../../../../modules/organization-tag-dialog/services/organization-tag-dialog.service';
import { OrganizationTagControllerService } from '../../../../services/organization-tag-controller.service';
import { ViewOrganizationTag } from '../../../../view-models';

@Component({
    selector: `os-organization-tag-list`,
    templateUrl: `./organization-tag-list.component.html`,
    styleUrls: [`./organization-tag-list.component.scss`]
})
export class OrganizationTagListComponent extends BaseListViewComponent<ViewOrganizationTag> {
    public constructor(
        protected override translate: TranslateService,
        public repo: OrganizationTagControllerService,
        private promptService: PromptService,
        private dialog: OrganizationTagDialogService,
        private colorService: ColorService,
        private theme: ThemeService
    ) {
        super();
        super.setTitle(`Tags`);
        this.canMultiSelect = true;
    }

    public createOrganizationTag(): Promise<void> {
        return this.editOrganizationTag();
    }

    public async editOrganizationTag(orgaTag?: ViewOrganizationTag): Promise<void> {
        const dialogRef = await this.dialog.open({
            organizationTag: orgaTag,
            defaultColor: this.theme.currentAccentColor,
            getRandomColor: () => this.colorService.getRandomHtmlColor()
        });
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            if (!orgaTag) {
                // Creating a new tag...
                this.repo.create(result);
            } else {
                this.repo.update(result, orgaTag);
            }
        }
    }

    public async deleteOrganizationTags(...orgaTags: ViewOrganizationTag[]): Promise<void> {
        const title =
            orgaTags.length === 1
                ? this.translate.instant(`Are you sure you want to delete this tag?`)
                : this.translate.instant(`Are you sure you want to delete all selected tags?`);
        const content = orgaTags.length === 1 ? orgaTags[0].name : ``;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(...orgaTags);
        }
    }

    public deleteSelectedTags(): void {
        this.deleteOrganizationTags(...this.selectedRows);
    }
}
