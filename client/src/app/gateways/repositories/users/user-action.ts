export class UserAction {
    public static readonly CREATE = `user.create`;
    public static readonly UPDATE = `user.update`;
    public static readonly DELETE = `user.delete`;
    public static readonly GENERATE_NEW_PASSWORD = `user.generate_new_password`;
    public static readonly RESET_PASSWORD_TO_DEFAULT = `user.reset_password_to_default`;
    public static readonly SEND_INVITATION_EMAIL = `user.send_invitation_email`;
    public static readonly SET_PASSWORD = `user.set_password`;
    public static readonly SET_PASSWORD_SELF = `user.set_password_self`;
    public static readonly SET_PRESENT = `user.set_present`;
    public static readonly UPDATE_SELF = `user.update_self`;
    public static readonly TOGGLE_PRESENCE_BY_NUMBER = `user.toggle_presence_by_number`;
    public static readonly FORGET_PASSWORD = `user.forget_password`;
    public static readonly FORGET_PASSWORD_CONFIRM = `user.forget_password_confirm`;
    public static readonly ASSIGN_MEETINGS = `user.assign_meetings`;
    public static readonly MERGE_TOGETHER = `user.merge_together`;
    public static readonly ACCOUNT_JSON_UPLOAD = `account.json_upload`;
    public static readonly ACCOUNT_IMPORT = `account.import`;
    public static readonly PARTICIPANT_JSON_UPLOAD = `participant.json_upload`;
    public static readonly PARTICIPANT_IMPORT = `participant.import`;
}
