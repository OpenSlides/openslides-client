import { Component } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';

@Component({
    selector: `os-mediafile-main`,
    templateUrl: `./mediafile-main.component.html`,
    styleUrls: [`./mediafile-main.component.scss`]
})
export class MediafileMainComponent extends BaseModelRequestHandlerComponent {}
