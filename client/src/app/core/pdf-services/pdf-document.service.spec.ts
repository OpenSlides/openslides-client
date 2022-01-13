import { TestBed } from '@angular/core/testing';
import { E2EImportsModule } from 'e2e-imports.module';

import { PdfDocumentService } from './pdf-document.service';

const testDateA = `01.01.2022`;
const testDateB = `11.01.2022`;

fdescribe(`PdfDocumentService`, () => {
    let service: PdfDocumentService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [PdfDocumentService]
        });
        service = TestBed.inject(PdfDocumentService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });

    it(`should return a single date from a single date`, () => {
        expect((service as any).formatTimeRange(testDateA)).toBe(testDateA);
    });

    it(`should return a single date from a duplicated date`, () => {
        expect((service as any).formatTimeRange(testDateA, testDateA)).toBe(testDateA);
    });

    it(`should return a range from a date range`, () => {
        expect((service as any).formatTimeRange(testDateA, testDateB)).toBe(`${testDateA} - ${testDate}`);
    });
});
