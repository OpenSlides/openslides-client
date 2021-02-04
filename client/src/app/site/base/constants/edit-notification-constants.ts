/**
 * Enum to define different types of notifications.
 */
export enum EditNotificationType {
    /**
     * Type to declare editing a base-model.
     */
    TYPE_BEGIN_EDITING = 'typeBeginEditing',

    /**
     * Type if the edit-view is closing.
     */
    TYPE_CLOSING_EDITING = 'typeClosingEditing',

    /**
     * Type if changes are saved.
     */
    TYPE_SAVING_EDITING = 'typeSavingEditing',

    /**
     * Type to declare if another person is also editing the same base-model.
     */
    TYPE_ALSO_EDITING = 'typeAlsoEditing'
}
