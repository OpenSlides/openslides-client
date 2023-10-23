import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';

export enum ImportStepPhase {
    ENQUEUED,
    PENDING,
    FINISHED,
    ERROR
}

export interface ImportStep {
    readonly phase: ImportStepPhase;
    startImport(): void;
    finishImport(): void;
    getModelsToCreateAmount(): number;
    getModelsImportedAmount(): number;
    getDescription(): string;
}

interface ImportStepDescriptorConfig {
    verboseNameFn?: VerboseNameFn;
    labelFn?: LabelFn;
    translateFn?: TranslateFn;
}

type LabelFn = string | ((phase: ImportStepPhase, plural?: boolean) => string);
type VerboseNameFn = string | ((plural?: boolean) => string);
type TranslateFn = (key: string) => string;

export class ImportStepDescriptor {
    private readonly _verboseNameFn: VerboseNameFn | undefined;
    private readonly _labelFn: LabelFn | undefined;
    private readonly _translateFn: TranslateFn;

    public constructor({ verboseNameFn, labelFn, translateFn }: ImportStepDescriptorConfig) {
        this._verboseNameFn = verboseNameFn;
        this._labelFn = labelFn;
        this._translateFn = translateFn ?? (key => key);
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
        } else if (typeof this._labelFn === `function`) {
            return this._labelFn(phase, plural);
        }
        throw new Error(`"labelFn" has to be of type string or function`);
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
