import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ImportStepPhase } from 'app/core/ui-services/base-import.service';

type LabelFn = string | ((phase: ImportStepPhase, plural?: boolean) => string);
type VerboseNameFn = string | ((plural?: boolean) => string);

export class ImportStepDescriptor {
    private readonly _verboseNameFn: VerboseNameFn;
    private readonly _labelFn: LabelFn;

    public constructor({ verboseNameFn, labelFn }: { verboseNameFn?: VerboseNameFn; labelFn?: LabelFn }) {
        this._verboseNameFn = verboseNameFn;
        this._labelFn = labelFn;
    }

    public getDescription(phase: ImportStepPhase, plural?: boolean): string {
        if (this._labelFn) {
            return this.getLabel(phase, plural);
        } else {
            return this.getVerboseName(phase, plural);
        }
    }

    private getLabel(phase: ImportStepPhase, plural?: boolean): string {
        if (typeof this._labelFn === `string`) {
            return this._labelFn;
        } else {
            return this._labelFn(phase, plural);
        }
    }

    private getVerboseName(phase: ImportStepPhase, plural?: boolean): string {
        let verboseName = ``;
        if (typeof this._verboseNameFn === `string`) {
            verboseName = this._verboseNameFn;
        } else if (typeof this._verboseNameFn === `function`) {
            verboseName = this._verboseNameFn(plural);
        } else {
            throw new Error(_(`No verbose name is defined`));
        }
        return `${_(verboseName)} ${this.getDescriptionByPhase(phase)}`;
    }

    private getDescriptionByPhase(phase: ImportStepPhase): string {
        switch (phase) {
            case ImportStepPhase.FINISHED:
                return _(`have been created`);
            case ImportStepPhase.ERROR:
                return _(`could not be created`);
            default:
                return _(`will be created`);
        }
    }
}
