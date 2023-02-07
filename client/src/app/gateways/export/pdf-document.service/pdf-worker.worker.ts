/// <reference lib="webworker" />

import * as pdfMake from 'pdfmake/build/pdfmake';

const osTableLayout = {
    switchColorTableLayout: {
        hLineWidth: (rowIndex: any) => rowIndex === 1,
        vLineWidth: () => 0,
        fillColor: (rowIndex: any) => (rowIndex % 2 === 0 ? `#EEEEEE` : null)
    },
    metaboxLayout: {
        fillColor: () => `#dddddd`,
        hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
        vLineWidth: () => 0,
        hLineColor: () => `white`
    }
};

function applyLayout(content: any): void {
    for (const section of content) {
        if (Array.isArray(section)) {
            applyLayout(section);
        } else {
            if (section && section.layout) {
                let layout: object;
                switch (section.layout) {
                    case `switchColorTableLayout`: {
                        layout = osTableLayout.switchColorTableLayout;
                        break;
                    }
                    case `metaboxLayout`: {
                        layout = osTableLayout.metaboxLayout;
                        break;
                    }
                }

                if (layout!) {
                    section.layout = layout;
                }
            }
        }
    }
}

/**
 * Sets the internal PdfMake fonts and VFS
 */
function initPdfMake(data: any): void {
    pdfMake.fonts = {
        PdfFont: data.fonts
    };

    pdfMake.vfs = data.vfs;
}

/**
 * Replace the palceholder with actual page numbers
 * @param data
 */
function addPageNumbers(data: any): void {
    // to allow page numbers in every page, after the initial "%PAGENR%" placeholder was reset
    let countPageNumbers = false;

    data.doc.footer = (currentPage: any, pageCount: any) => {
        const footer = data.doc.tmpfooter;

        // if the tmpfooter starts with an image, the pagenumber will be found in column 1
        const pageNumberColIndex = !!footer.columns[0].image ? 1 : 0;

        // "%PAGENR% needs to be found once. After that, the same position should always update page numbers"
        if (footer.columns[pageNumberColIndex]?.stack[0] === `%PAGENR%` || countPageNumbers) {
            countPageNumbers = true;
            footer.columns[pageNumberColIndex].stack[0] = {
                text: `${currentPage} / ${pageCount}`,
                alignment: data.settings?.export_pdf_pagenumber_alignment ?? `center`
            };
        }
        return footer;
    };
}

/**
 * The actual web worker code
 */
addEventListener(`message`, ({ data }) => {
    initPdfMake(data);

    applyLayout(data.doc.content);

    if (data.doc.tmpfooter) {
        addPageNumbers(data);
    }

    const pdfGenerator = pdfMake.createPdf(data.doc);

    pdfGenerator.getBlob(
        (blob: any) => {
            // post the result back to the main thread
            postMessage(blob);
        },
        {
            progressCallback: (progress: any) => {
                postMessage(progress);
            }
        }
    );
});
