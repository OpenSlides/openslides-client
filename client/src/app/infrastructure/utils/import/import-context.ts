import { BehaviorSubject, Observable } from 'rxjs';

import { ImportStepPhase } from './import-step';

export interface SharedImportContext {
    phase: ImportStepPhase;
    setData<D>(key: string, data: D): void;
    getData<D>(key: string): D | undefined;
}

export class ImportContext<ToImport> {
    public set models(value: ToImport[]) {
        this._modelsToCreateSubject.next(value);
    }

    public get models(): ToImport[] {
        return this._modelsToCreateSubject.value;
    }

    public set modelsImported(value: ToImport[]) {
        this._modelsImportedSubject.next(value);
    }

    public get modelsImported(): ToImport[] {
        return this._modelsImportedSubject.value;
    }

    public get phase(): ImportStepPhase {
        return this._importStepPhaseSubject.value;
    }

    public set phase(value: ImportStepPhase) {
        this._importStepPhaseSubject.next(value);
    }

    public get phaseObservable(): Observable<ImportStepPhase> {
        return this._importStepPhaseSubject;
    }

    private _data: { [key: string]: any } = {};

    private readonly _modelsToCreateSubject = new BehaviorSubject<ToImport[]>([]);
    private readonly _modelsImportedSubject = new BehaviorSubject<ToImport[]>([]);
    private readonly _importStepPhaseSubject = new BehaviorSubject<ImportStepPhase>(ImportStepPhase.ENQUEUED);

    public clearData(): void {
        this._data = {};
    }

    public setData<D>(key: string, data: D): void {
        this._data[key] = data;
    }

    public getData<D>(key: string): D | undefined {
        return this._data[key] as D;
    }

    public getSharedContext(): SharedImportContext {
        return {
            phase: this.phase,
            setData: (key, data) => this.setData(key, data),
            getData: key => this.getData(key)
        };
    }
}
