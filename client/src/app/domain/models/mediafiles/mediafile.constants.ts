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
    projector_main: `Projector logo`,
    projector_header: `Projector header image`,
    web_header: `Web interface header logo`,
    pdf_header_l: `PDF header logo (left)`,
    pdf_header_r: `PDF header logo (right)`,
    pdf_footer_l: `PDF footer logo (left)`,
    pdf_footer_r: `PDF footer logo (right)`,
    pdf_ballot_paper: `PDF ballot paper logo`
};

export type FontPlace = 'regular' | 'italic' | 'bold' | 'bold_italic' | 'monospace' | 'chyron_speaker_name';
export const FontDisplayNames: { [place in FontPlace]: string } = {
    regular: `Font regular`,
    italic: `Font italic`,
    bold: `Font bold`,
    bold_italic: `Font bold italic`,
    monospace: `Font monospace`,
    chyron_speaker_name: `Chyron speaker name`
};
export const FontDefaults: { [place in FontPlace]: string } = {
    regular: `assets/fonts/fira-sans-latin-400.woff`,
    italic: `assets/fonts/fira-sans-latin-400italic.woff`,
    bold: `assets/fonts/fira-sans-latin-500.woff`,
    bold_italic: `assets/fonts/fira-sans-latin-500italic.woff`,
    monospace: `assets/fonts/roboto-condensed-bold.woff`,
    chyron_speaker_name: `assets/fonts/fira-sans-latin-400.woff`
};
