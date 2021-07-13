import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PblColumnDefinition } from '@pebula/ngrid';
import { Observable, of } from 'rxjs';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { ColorService } from 'app/core/ui-services/color.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganization } from 'app/management/models/view-organization';
import { ViewOrganizationTag } from 'app/management/models/view-organization-tag';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { OrganizationTagDialogComponent } from '../organization-tag-dialog/organization-tag-dialog.component';

@Component({
    selector: 'os-organization-tag-list',
    templateUrl: './organization-tag-list.component.html',
    styleUrls: ['./organization-tag-list.component.scss']
})
export class OrganizationTagListComponent extends BaseListViewComponent<ViewOrganizationTag> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'name',
            width: 'auto'
        },
        {
            prop: 'info',
            width: '65%'
        },
        {
            prop: 'edit',
            width: this.singleButtonWidth
        },
        {
            prop: 'delete',
            width: this.singleButtonWidth
        }
    ];

    public constructor(
        serviceCollector: ComponentServiceCollector,
        public repo: OrganizationTagRepositoryService,
        private dialog: MatDialog,
        private promptService: PromptService,
        private colorService: ColorService
    ) {
        super(serviceCollector);
        super.setTitle('Organization tags');
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
    }

    public createOrganizationTag(): Promise<void> {
        return this.editOrganizationTag();
    }

    public async editOrganizationTag(orgaTag?: ViewOrganizationTag): Promise<void> {
        const dialogRef = this.dialog.open(OrganizationTagDialogComponent, {
            ...mediumDialogSettings,
            data: {
                organizationTag: orgaTag,
                getRandomColor: () => this.colorService.getRandomHtmlColor()
            }
        });
        const result = await dialogRef.afterClosed().toPromise();
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
        const dialogTitle =
            orgaTags.length === 1
                ? this.translate.instant('Are you sure you want to delete this organization tag?')
                : this.translate.instant('Are you sure you want to delete all selected tags?');
        const dialogSubtitle = orgaTags.length === 1 ? orgaTags[0].name : '';
        if (await this.promptService.open(dialogTitle, dialogSubtitle)) {
            await this.repo.delete(...orgaTags);
        }
    }

    public deleteSelectedTags(): void {
        this.deleteOrganizationTags(...this.selectedRows);
    }

    public getCommitteesByTag(orgaTag: ViewOrganizationTag): Observable<ViewCommittee[]> {
        return of(orgaTag.tagged.filter(tagged => tagged.collection === ViewCommittee.COLLECTION) as ViewCommittee[]);
    }

    public getMeetingsByTag(orgaTag: ViewOrganizationTag): Observable<ViewMeeting[]> {
        return of(orgaTag.tagged.filter(tagged => tagged.collection === ViewMeeting.COLLECTION) as ViewMeeting[]);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [1],
            fieldset: 'list',
            follow: [
                {
                    idField: 'organization_tag_ids',
                    follow: [
                        {
                            idField: 'tagged_ids'
                        }
                    ]
                }
            ]
        };
    }
}
