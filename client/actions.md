# Actions for OpenSlides-Client

Here, all actions are listed, which the client will support.
Actions are sent to the backend instead of any http-requests.

### Currently supported actions

-   [x] topic:

    -   topic.create (id, title, text, attachment_ids)
    -   topic.update (id, title, text, attachment_ids)
    -   topic.delete (id)

-   [x] motion:

    -   motion.update (id, title, statute_paragraph_id)
    -   motion.update_metadata (id, category_id, block_id, origin_id, state_id, state_extension, recommendation_id, recommendation_extension, supporter_ids, tag_ids)
    -   motion.sort (id)
    -   motion.delete (id)

-   [x] agenda_item:

    -   agenda_item.create (meeting_id, item_number, comment)
    -   agenda_item.delete (id)
    -   agenda_item.update (id, item_number, comment)
    -   agenda_item.numbering (meeting_id)

-   [x] meeting:

    -   meeting.create (commitee_id, name)
    -   meeting.update (id, name)
    -   meeting.delete (id)

-   [x] commitee:
    -   commitee.create (organization_id, name)

### Actions to implement

These chapter lists all actions, that have to implement:

-   [ ] motions.create
-   [ ] motions.update
-   [ ] history
-   [ ] pdf.convert_url_to_base_64
-   [ ] agenda_item.sort
-   [ ] los.create
-   [ ] los.delete
-   [ ] los.delete_all
-   [ ] los.sort
-   [ ] los.readd_last_speaker
-   [ ] los.mark_speaker
-   [ ] los.stop_current_speaker
-   [ ] los.start_speaker
-   [ ] los.delete_all_speakers_of_all_lists
-   [ ] assignment.sort
-   [ ] assignment.change_candidate
-   [ ] assignment.add_self
-   [ ] assignment.delete_self
-   [ ] mediafile.bulk_delete
-   [ ] mediafile.upload
-   [ ] mediafile.move
-   [ ] motion_block.follow_recommendation
-   [ ] motion_category.number_motions
-   [ ] motion_category.sort_categories
-   [ ] motion_category.sort_motions_in_categories
-   [ ] user.reset_password
-   [ ] user.set_new_password
-   [ ] user.bulk_reset_password
-   [ ] user.bulk_generate_new_password
-   [ ] user.bulk_create
-   [ ] user.bulk_delete
-   [ ] user.bulk_set_state
-   [ ] user.bulk_alter_group
-   [ ] user.bulk_send_invitation_email
-   [ ] login_data.refresh
-   [ ] media_manage.set_as
-   [ ] motion_multiselect.move_item_to
-   [ ] motion_multiselect.set_recommendation
-   [ ] motion_multiselect.change_submitters
-   [ ] motion_multiselect.change_tags
