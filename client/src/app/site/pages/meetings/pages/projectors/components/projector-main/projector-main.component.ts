import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

@Component({
    selector: `os-projector-main`,
    templateUrl: `./projector-main.component.html`,
    styleUrls: [`./projector-main.component.scss`]
})
export class ProjectorMainComponent extends BaseModelRequestHandlerComponent {}
