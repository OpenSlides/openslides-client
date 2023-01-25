import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export type LogoPlace =
    | 'projector_main'
    | 'projector_header'
    | 'web_header'
    | 'pdf_header_l'
    | 'pdf_header_r'
    | 'pdf_footer_l'
    | 'pdf_footer_r'
    | 'pdf_ballot_paper';
export const LogoDisplayNames: { [place in LogoPlace]: string } = {
    projector_main: _(`Projector logo`),
    projector_header: _(`Projector header image`),
    web_header: _(`Web interface header logo`),
    pdf_header_l: _(`PDF header logo (left)`),
    pdf_header_r: _(`PDF header logo (right)`),
    pdf_footer_l: _(`PDF footer logo (left)`),
    pdf_footer_r: _(`PDF footer logo (right)`),
    pdf_ballot_paper: _(`PDF ballot paper logo`)
};

export type FontPlace =
    | 'regular'
    | 'italic'
    | 'bold'
    | 'bold_italic'
    | 'monospace'
    | 'chyron_speaker_name'
    | 'projector_h1'
    | 'projector_h2';
export const FontDisplayNames: { [place in FontPlace]: string } = {
    regular: _(`Font regular`),
    italic: _(`Font italic`),
    bold: _(`Font bold`),
    bold_italic: _(`Font bold italic`),
    monospace: _(`Font monospace`),
    chyron_speaker_name: _(`Chyron speaker name`),
    projector_h1: _(`Projector h1`),
    projector_h2: _(`Projector h2`)
};
export const FontDefaults: { [place in FontPlace]: string } = {
    regular: `assets/fonts/fira-sans-latin-400.woff`,
    italic: `assets/fonts/fira-sans-latin-400italic.woff`,
    bold: `assets/fonts/fira-sans-latin-500.woff`,
    bold_italic: `assets/fonts/fira-sans-latin-500italic.woff`,
    monospace: `assets/fonts/roboto-condensed-bold.woff`,
    chyron_speaker_name: `assets/fonts/fira-sans-latin-400.woff`,
    projector_h1: `assets/fonts/fira-sans-latin-500.woff`,
    projector_h2: `assets/fonts/fira-sans-latin-400.woff`
};
