import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: `root` })
export class GlobalHeadbarService {
    private _headbar: TemplatePortal = null;

    public get headbar() {
        return this._headbar;
    }

    public set headbar(portal: TemplatePortal) {
        this._headbar = portal;
    }
}
