import { Fqid } from 'app/core/definitions/key-types';
import { EditNotificationType } from './constants/edit-notification-constants';

/**
 * Class to specify the notifications for editing a motion.
 */
export interface EditNotification {
    /**
     * The id of the motion the user wants to edit.
     * Necessary to identify if users edit the same motion.
     */
    baseModelFqid: Fqid;

    /**
     * The id of the sender.
     * Necessary if this differs from senderUserId.
     */
    senderId: number;

    /**
     * The name of the sender.
     * To show the names of the other editors
     */
    senderName: string;

    /**
     * The type of the notification.
     * Separates if the user is beginning the work or closing the edit-view.
     */
    type: EditNotificationType;
}
