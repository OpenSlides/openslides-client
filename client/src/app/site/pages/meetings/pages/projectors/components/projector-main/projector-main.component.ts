import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { getProjectorListSubscriptionConfig } from '../../config/model-subscription';

@Component({
    selector: 'os-projector-main',
    templateUrl: './projector-main.component.html',
    styleUrls: ['./projector-main.component.scss']
})
export class ProjectorMainComponent extends BaseModelRequestHandlerComponent {}
