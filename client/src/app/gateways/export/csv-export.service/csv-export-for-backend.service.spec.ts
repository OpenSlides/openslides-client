import { TestBed } from '@angular/core/testing';
import { BaseViewModel } from 'src/app/site/base/base-view-model';

import { FileExportService } from '../file-export.service';
import { CsvExportForBackendService } from './csv-export-for-backend.service';

class MockFileExportService {
    public lastSavedFiles: any[] = [];
    public saveFile(file: BlobPart, filename: string, mimeType?: string): void {
        this.lastSavedFiles.push({ file, filename, mimeType });
    }
}

class MockModel extends BaseViewModel {
    public get proper(): boolean {
        return this._model.proper;
    }

    public get tea(): string {
        return this._model.tea;
    }

    public get strength(): number {
        return this._model.strength;
    }

    public constructor(input?: any) {
        super(input);
    }

    public strengthSquared(): number {
        return this.strength ? this.strength * this.strength : 0;
    }
}

describe(`CsvExportForBackendService`, () => {
    let service: CsvExportForBackendService;
    let exportService: MockFileExportService;
    const toDummyExport = [
        { proper: true, tea: `Earl Grey`, strength: 5 },
        { proper: false, tea: `Herbal tea` }
    ];
    const toExport = toDummyExport.map(item => new MockModel(item));

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CsvExportForBackendService, { provide: FileExportService, useClass: MockFileExportService }]
        });

        service = TestBed.inject(CsvExportForBackendService);
        exportService = TestBed.inject(FileExportService) as unknown as MockFileExportService;
    });

    it(`test export method with default settings`, () => {
        service.export(
            toExport,
            [
                { property: `tea` },
                { label: `fancy`, map: model => (model.proper ? `yes` : `no`) },
                { property: `strength` }
            ],
            `assortmentOfTeas`
        );
        expect(exportService.lastSavedFiles.length).toBe(1);
        expect(exportService.lastSavedFiles[0]).toEqual({
            file: `tea,fancy,strength\r\n"Earl Grey","yes","5"\r\n"Herbal tea","no",`,
            filename: `assortmentOfTeas`,
            mimeType: `text/csv;charset=utf-8`
        });
    });

    it(`test export method with non-default encoding`, () => {
        service.export(toExport, [{ property: `proper` }, { property: `tea` }], `assortmentOfTeas2ElectricBoogaloo`, {
            encoding: `iso-8859-15`
        });
        expect(exportService.lastSavedFiles.length).toBe(1);
        expect(exportService.lastSavedFiles[0]).toEqual({
            file: new Uint8Array([
                112, 114, 111, 112, 101, 114, 44, 116, 101, 97, 13, 10, 34, 49, 34, 44, 34, 69, 97, 114, 108, 32, 71,
                114, 101, 121, 34, 13, 10, 44, 34, 72, 101, 114, 98, 97, 108, 32, 116, 101, 97, 34
            ]),
            filename: `assortmentOfTeas2ElectricBoogaloo`,
            mimeType: `text/csv;charset=iso-8859-15`
        });
    });

    it(`test export method with non-default settings`, () => {
        service.export(
            toExport,
            [{ property: `proper` }, { property: `tea` }, { property: `strengthSquared` }],
            `assortmentOfTeas2ElectricBoogaloo`,
            {
                lineSeparator: `:`,
                columnSeparator: `?`
            }
        );
        expect(exportService.lastSavedFiles.length).toBe(1);
        expect(exportService.lastSavedFiles[0]).toEqual({
            file: `proper?tea?strengthSquared:"1"?"Earl Grey"?"25":?"Herbal tea"?"0"`,
            filename: `assortmentOfTeas2ElectricBoogaloo`,
            mimeType: `text/csv;charset=utf-8`
        });
    });

    it(`test export method error`, () => {
        expect(() =>
            service.export(toExport, [{ property: `tea` }], `assortmentOfTeas`, {
                lineSeparator: `?`,
                columnSeparator: `?`
            })
        ).toThrowError(`lineseparator and columnseparator must differ from each other`);
        expect(exportService.lastSavedFiles.length).toBe(0);
    });

    it(`test dummy export method with default settings`, () => {
        service.dummyCSVExport(
            { proper: `Fancy`, tea: `Tea`, strength: `Muscle` },
            toDummyExport,
            `dummyAssortmentOfTeas`
        );
        expect(exportService.lastSavedFiles.length).toBe(1);
        expect(exportService.lastSavedFiles[0]).toEqual({
            file: `proper,tea,strength\r\n"1","Earl Grey","5"\r\n,"Herbal tea",`,
            filename: `dummyAssortmentOfTeas`,
            mimeType: `text/csv`
        });
    });
});
