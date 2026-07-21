import { TemplatePortal } from '@angular/cdk/portal';
import { Service } from '@angular/core';

@Service()
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
