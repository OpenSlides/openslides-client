import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Permission } from 'src/app/domain/definitions/permission';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ExportFileFormat } from 'src/app/site/pages/meetings/pages/motions/services/export/definitions';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ExportDialogComponent } from '../components';
import { ExportDialogModule } from '../export-dialog.module';

export type ExportInfoChoiceType<T> = T extends Array<any> ? T[number] : T;

type ExportDialogSettingsKeys<ExportInfo extends { format?: ExportFileFormat }> = keyof ExportInfo;

export type ExportDialogSettings<ExportInfo extends { format?: ExportFileFormat }> = {
    title: string;
    settings: {
        [key in ExportDialogSettingsKeys<ExportInfo>]: {
            label?: string;
            weight: number;
            multiple: ExportInfo[key] extends Array<any> ? true : false;
            offState?: ExportInfoChoiceType<ExportInfo[key]>;
            disableForFormat?: ExportFileFormat[];
            choices: Map<
                ExportInfoChoiceType<ExportInfo[key]>,
                {
                    label?: string;
                    perms?: Permission;
                    disableWhen?: { otherValue: ExportInfo[key]; checked: boolean }[];
                    disableForFormat?: ExportFileFormat[];
                    changeStateForFormat?: { format: ExportFileFormat[]; value: boolean }[];
                }
            >;
        };
    };
};

@Injectable({
    providedIn: ExportDialogModule
})
export abstract class ExportDialogService<
    T extends BaseViewModel,
    ExportInfo extends { format?: ExportFileFormat }
> extends BaseDialogService<ExportDialogComponent<T, ExportInfo>, T[], ExportInfo> {
    protected abstract get settings(): ExportDialogSettings<ExportInfo>;
    protected abstract readonly storageKey: string;
    protected abstract get defaults(): ExportInfo;

    public constructor(dialog: MatDialog) {
        super(dialog);
    }

    public override async open(data: T[]): Promise<MatDialogRef<ExportDialogComponent<T, ExportInfo>, ExportInfo>> {
        const module = await import(`../export-dialog.module`).then(m => m.ExportDialogModule);
        return this.dialog.open(module.getComponent()<T, ExportInfo>, {
            data: { data, settings: this.settings, storageKey: this.storageKey, defaults: this.defaults },
            ...largeDialogSettings
        });
    }
}
