import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';
import { OrganizationTagDialogModule } from '../organization-tag-dialog.module';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ViewOrganizationTag } from '../../../view-models';
import { HtmlColor } from 'src/app/domain/definitions/key-types';
import { OrganizationTagDialogComponent } from '../components/organization-tag-dialog.component';

export interface OrganizationTagDialogData {
    organizationTag?: ViewOrganizationTag;
    defaultColor: HtmlColor;
    getRandomColor: () => HtmlColor;
}

interface OrganizationTagDialogResult {
    name: string;
    color: HtmlColor;
}

@Injectable({
    providedIn: OrganizationTagDialogModule
})
export class OrganizationTagDialogService extends BaseDialogService<
    OrganizationTagDialogComponent,
    OrganizationTagDialogData,
    OrganizationTagDialogResult
> {
    public async open(
        data: OrganizationTagDialogData
    ): Promise<MatDialogRef<OrganizationTagDialogComponent, OrganizationTagDialogResult>> {
        const module = await import(`../organization-tag-dialog.module`);
        return this.dialog.open(module.OrganizationTagDialogModule.getComponent(), { ...mediumDialogSettings, data });
    }
}
