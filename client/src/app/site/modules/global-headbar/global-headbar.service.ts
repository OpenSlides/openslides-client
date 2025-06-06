import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: `root` })
export class GlobalHeadbarService {
    private _headbar: TemplatePortal = null;
    private _additionalHeadbar: TemplatePortal = null;
    public longpolling = false;

    public get headbar(): TemplatePortal<any> {
        return this._headbar;
    }

    public set headbar(portal: TemplatePortal) {
        this._headbar = portal;
    }

    public get additionalHeadbar(): TemplatePortal<any> {
        return this._additionalHeadbar;
    }

    public set additionalHeadbar(portal: TemplatePortal) {
        this._additionalHeadbar = portal;
    }
}
