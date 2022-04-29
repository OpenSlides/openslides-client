import { Component, OnInit } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

@Component({
    selector: 'os-motion-poll-main',
    templateUrl: './motion-poll-main.component.html',
    styleUrls: ['./motion-poll-main.component.scss']
})
export class MotionPollMainComponent extends BaseModelRequestHandlerComponent {}
