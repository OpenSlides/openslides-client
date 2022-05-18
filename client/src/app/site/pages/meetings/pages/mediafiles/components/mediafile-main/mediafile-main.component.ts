import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

const MEDIAFILE_SUBSCRIPTION = `mediafile`;

@Component({
    selector: 'os-mediafile-main',
    templateUrl: './mediafile-main.component.html',
    styleUrls: ['./mediafile-main.component.scss']
})
export class MediafileMainComponent extends BaseModelRequestHandlerComponent {}
