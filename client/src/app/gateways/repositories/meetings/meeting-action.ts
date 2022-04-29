export class MeetingAction {
    public static readonly CREATE = `meeting.create`;
    public static readonly UPDATE = `meeting.update`;
    public static readonly DELETE = `meeting.delete`;
    public static readonly CREATE_FROM_TEMPLATE = `meeting.create_from_template`;
    public static readonly DELETE_ALL_SPEAKERS_OF_ALL_LISTS = `meeting.delete_all_speakers_of_all_lists`;
    public static readonly SET_FONT = `meeting.set_font`;
    public static readonly SET_LOGO = `meeting.set_logo`;
    public static readonly UNSET_FONT = `meeting.unset_font`;
    public static readonly UNSET_LOGO = `meeting.unset_logo`;
    public static readonly IMPORT = `meeting.import`;
    public static readonly CLONE = `meeting.clone`;
    public static readonly ARCHIVE = `meeting.archive`;
    public static readonly UNARCHIVE = `meeting.unarchive`;
}
