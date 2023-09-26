import { TestBed } from '@angular/core/testing';
import { Content } from 'pdfmake/interfaces';
import { E2EImportsModule } from 'src/e2e-imports.module';

import { ExportServiceModule } from '../export-service.module';
import { HtmlToPdfService } from './html-to-pdf.service';

describe(`HtmlToPdfService`, () => {
    let service: HtmlToPdfService;

    const LINE_HEIGHT = 1.25;
    const P_MARGIN_BOTTOM = 4.0;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule, ExportServiceModule]
        });
        service = TestBed.inject(HtmlToPdfService);
    });

    describe(`addPlainText`, () => {
        it(`create a simple text node`, () => {
            const result = service.addPlainText(`foo`);
            const col: Content = {
                columns: [
                    {
                        stack: [
                            {
                                text: `foo`
                            }
                        ]
                    }
                ]
            };
            expect(result).toEqual(col);
        });
    });

    describe(`convertHtml`, () => {
        it(`should handle empty input`, () => {
            const result = service.convertHtml({ htmlText: `` });
            expect(result).toEqual(<Content[]>[]);
        });

        it(`should handle single main nodes`, () => {
            const result = service.convertHtml({ htmlText: `<p>Row 1</p>` });
            expect(result).toEqual(<Content[]>[
                { text: [{ text: `Row 1` }], lineHeight: LINE_HEIGHT, margin: [0, 0, 0, P_MARGIN_BOTTOM] }
            ]);
        });

        it(`should handle multiple main nodes`, () => {
            const result = service.convertHtml({ htmlText: `<p>Row 1</p><p>Row 2</p>` });
            expect(result).toEqual(<Content[]>[
                { text: [{ text: `Row 1` }], lineHeight: LINE_HEIGHT, margin: [0, 0, 0, P_MARGIN_BOTTOM] },
                { text: [{ text: `Row 2` }], lineHeight: LINE_HEIGHT, margin: [0, 0, 0, P_MARGIN_BOTTOM] }
            ]);
        });
    });

    describe(`convert lists`, () => {
        it(`should handle single main nodes`, () => {
            const result = service.convertHtml({ htmlText: `<ul><li>Line 1</li><li>Line 2</li></ul>` });
            expect(result).toEqual(<Content[]>[
                {
                    ul: [
                        { text: [{ text: `Line 1` }], lineHeight: LINE_HEIGHT, margin: [0, 0, 0, P_MARGIN_BOTTOM] },
                        { text: [{ text: `Line 2` }], lineHeight: LINE_HEIGHT, margin: [0, 0, 0, P_MARGIN_BOTTOM] }
                    ]
                }
            ]);
        });
    });

    describe(`convert styling`, () => {
        it(`underlined span`, () => {
            const result = service.convertHtml({
                htmlText: `<span style="text-decoration: underline">Underlined</span>`
            });
            expect(result).toEqual(<Content[]>[
                { text: [{ text: `Underlined`, decoration: `underline` }], decoration: `underline` }
            ]);
        });

        it(`struck span`, () => {
            const result = service.convertHtml({
                htmlText: `<span style="text-decoration: line-through">Struck</span>`
            });
            expect(result).toEqual(<Content[]>[
                { text: [{ text: `Struck`, decoration: `lineThrough` }], decoration: `lineThrough` }
            ]);
        });

        it(`nested underlined and struck spans`, () => {
            const result = service.convertHtml({
                htmlText: `<span style="text-decoration: line-through"><span style="text-decoration: underline">Both</span></span>`
            });
            expect(result).toEqual(<Content[]>(<unknown>[
                {
                    text: [
                        {
                            text: [{ text: `Both`, decoration: [`underline`, `lineThrough`] }],
                            decoration: [`underline`, `lineThrough`]
                        }
                    ],
                    decoration: `lineThrough`
                }
            ]));
        });

        it(`nested underlined and struck spans 2`, () => {
            const result = service.convertHtml({
                htmlText: `<span style="text-decoration: underline"><span style="text-decoration: line-through">Both</span></span>`
            });
            expect(result).toEqual(<Content[]>(<unknown>[
                {
                    text: [
                        {
                            text: [{ text: `Both`, decoration: [`lineThrough`, `underline`] }],
                            decoration: [`lineThrough`, `underline`]
                        }
                    ],
                    decoration: `underline`
                }
            ]));
        });
    });

    describe(`convert format tags`, () => {
        it(`url`, () => {
            const result = service.convertHtml({ htmlText: `<a href="http://example.test">Link</a>` });
            expect(result).toEqual(<Content[]>[
                { text: [{ text: `Link`, decoration: `underline`, color: `blue`, link: `http://example.test/` }] }
            ]);
        });
    });
});
