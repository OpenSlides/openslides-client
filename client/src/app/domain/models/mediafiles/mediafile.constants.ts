import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const LogoDisplayNames = {
    projector_main: _(`Projector logo`),
    projector_header: _(`Projector header image`),
    web_header: _(`Web interface header logo`),
    pdf_header_l: _(`PDF header logo (left)`),
    pdf_header_r: _(`PDF header logo (right)`),
    pdf_footer_l: _(`PDF footer logo (left)`),
    pdf_footer_r: _(`PDF footer logo (right)`),
    pdf_ballot_paper: _(`PDF ballot paper logo`)
};
export type LogoPlace = keyof typeof LogoDisplayNames;
export const LOGO_PLACES = Object.keys(LogoDisplayNames) as LogoPlace[];

export const FontDisplayNames = {
    regular: _(`Font regular`),
    italic: _(`Font italic`),
    bold: _(`Font bold`),
    bold_italic: _(`Font bold italic`),
    monospace: _(`Font monospace`),
    chyron_speaker_name: _(`Chyron speaker name`),
    projector_h1: _(`Projector h1`),
    projector_h2: _(`Projector h2`)
};
export type FontPlace = keyof typeof FontDisplayNames;
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
export const FONT_PLACES = Object.keys(FontDisplayNames) as FontPlace[];

export type ViewMediafileMeetingUsageKey =
    | `used_as_logo_${LogoPlace | FontPlace}_in_meeting`
    | `used_as_font_${FontPlace}_in_meeting`;

export type MediafileMeetingUsageIdKey = `${ViewMediafileMeetingUsageKey}_id`;

export const MEDIAFILE_MEETING_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `used_as_logo_${place}_in_meeting_id` as MediafileMeetingUsageIdKey),
    ...FONT_PLACES.map(place => `used_as_font_${place}_in_meeting_id` as MediafileMeetingUsageIdKey)
];
