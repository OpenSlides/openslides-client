/**
 * Indicates the type of a modification when comparing ("diff"ing) two versions of a text.
 * - TYPE_INSERTION indicates an insertion. An insertion is when the new version of a text contains a certain string
 *   that did not exist in the original version of the.
 * - TYPE_DELETION indicates a replacement. A deletion is when the new version of a text does not contain a certain
 *   string contained in the original version of the text anymore.
 * - TYPE_REPLACEMENT indicates both of the above: the new version of the text contains text not present in the original
 *   version, but also removes some parts of that text.
 *
 * This enumeration is used when _automatically_ detecting the change type of an amendment / change recommendation.
 */
export enum ModificationType {
    TYPE_REPLACEMENT = `replacement`,
    TYPE_INSERTION = `insertion`,
    TYPE_DELETION = `deletion`
}

/**
 * Special id to reference the personal note in a comments list
 */
export const PERSONAL_NOTE_ID = -1;

/**
 * String String from the PDF option `flowText`
 */
export const MOTION_PDF_OPTIONS = {
    Toc: `toc`,
    Page: `page`,
    Date: `date`,
    Attachments: `attachments`,
    AddBreaks: `addBreaks`,
    Header: `header`,
    ContinuousText: `continuousText`
};

/**
 * The line numbering mode for the motion detail view.
 * The constants need to be in sync with the values saved in the config store.
 */
export enum LineNumberingMode {
    None = `none`,
    Inside = `inline`,
    Outside = `outside`
}

/**
 * The change recommendation mode for the motion detail view.
 */
export enum ChangeRecoMode {
    Original = `original`,
    Changed = `changed`,
    Diff = `diff`,
    Final = `agreed`,
    ModifiedFinal = `modified_final_version`
}

export enum AmendmentType {
    Amendment = 1,
    Parent,
    Lead
}

export const verboseChangeRecoMode = {
    original: `Original version`,
    changed: `Changed version`,
    diff: `Diff version`,
    agreed: `Final version`,
    modified_final_version: `Editorial final version`
};
