import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { ImportMeeting } from '@app/gateways/repositories/meeting-repository.service';
import { UploadFileJsonProcessorService } from '@app/infrastructure/utils/import/json-import-file-utils';
import { BaseComponent } from '@app/site/base/base.component';
import { MeetingControllerService } from '@app/site/pages/meetings/services/meeting-controller.service';
import { OpenSlidesRouterService } from '@app/site/services/openslides-router.service';
import { FileData } from '@app/ui/modules/file-upload/components/file-upload/file-upload.component';

@Component({
    selector: `os-meeting-import`,
    templateUrl: `./meeting-import.component.html`,
    styleUrls: [`./meeting-import.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MeetingImportComponent extends BaseComponent implements OnInit {
    private _committeeId: Id | null = null;

    public constructor(
        private repo: MeetingControllerService,
        private osRouter: OpenSlidesRouterService,
        private location: Location,
        private uploadFileProcessor: UploadFileJsonProcessorService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`committeeId`]) {
                    this._committeeId = +params[`committeeId`];
                }
            })
        );
    }

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => Promise<Identifiable> {
        return async file => {
            const meeting = await this.uploadFileProcessor.getUploadFileJson<ImportMeeting>(file);
            return this.repo.import(this._committeeId, meeting);
        };
    }
}
