/**
 * General settings all dialogs are using.
 */
const generalSettings = { disableClose: true, maxWidth: `90vw`, maxHeight: `90vh` };

/**
 * Settings to display a large (wide) dialog.
 * `width='1100px'`
 */
export const largeDialogSettings = {
    width: `1100px`,
    ...generalSettings
};

/**
 * Settings to display a medium dialog.
 * `width='804px'`
 */
export const mediumDialogSettings = {
    width: `804px`,
    ...generalSettings
};

/**
 * Settings to display a small dialog. Useful for info-dialogs.
 * `width='400px'`
 */
export const infoDialogSettings = {
    width: `400px`,
    ...generalSettings
};
