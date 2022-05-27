import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { ImportMeeting } from 'src/app/gateways/repositories/meeting-repository.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

@Component({
    selector: `os-meeting-import`,
    templateUrl: `./meeting-import.component.html`,
    styleUrls: [`./meeting-import.component.scss`]
})
export class MeetingImportComponent extends BaseComponent implements OnInit {
    public columns: PblColumnDefinition[] = [
        {
            prop: `title`,
            label: this.translate.instant(`Title`)
        }
    ];

    private committeeId: Id | null = null;

    public constructor(
        private repo: MeetingControllerService,
        private osRouter: OpenSlidesRouterService,
        private location: Location
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`committeeId`]) {
                    this.committeeId = +params[`committeeId`];
                }
            })
        );
    }

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => Promise<Identifiable> {
        return async file => {
            const meeting = await new Promise<ImportMeeting>(resolve => {
                const reader = new FileReader();
                reader.addEventListener(`load`, progress => {
                    const result = JSON.parse(progress.target.result as string);
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(this.committeeId, meeting);
        };
    }
}
