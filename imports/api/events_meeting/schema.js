import SimpleSchema from "simpl-schema";

export const EventMeetingSchema = new SimpleSchema({
  meetingId: { type: Number },
  eventId: { type: String, optional: false },
  host_id: { type: String, optional: true },
  host_email: { type: String, optional: true },
  topic: { type: String, optional: false },
  type: { type: Number, defaultValue: 1, optional: true },
  start_time: { type: String, optional: false },
  status: { type: String, optional: true },
  timezone: { type: String, optional: true },
  agenda: { type: String, optional: true },
  created_at: { type: String, optional: true },
  start_url: { type: String, optional: true },
  join_url: { type: String, optional: true },
  password: { type: String, defaultValue: "12345", optional: false },
  duration: { type: Number, defaultValue: 1, optional: false },
  removed: { type: Boolean, defaultValue: false, optional: true },
  inviteGuestList: { type: Array, optional: true },
  "inviteGuestList.$": String,
  typeTitle: { type: String, defaultValue: false, optional: true },
  listType: { type: String, optional: true },
  scheduledStatus: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  scheduledTime: {
    type: Date,
    optional: true,
  },
  invitationSentStatus: { type: Number, optional: true, defaultValue: 0 },
  activateMeeting : { type: Boolean, defaultValue: false, optional: true },
});

/*
{
    "uuid": "3WnkCt72SraBYdmePf+Rpw==",
    "id": 94597936913,
    "host_id": "NKwyUnmTQFuwliW0Uu-gew",
    "host_email": "official.vijay.2508@gmail.com",
    "topic": "test",
    "type": 1,
    "status": "waiting",
    "timezone": "Asia/Calcutta",
    "agenda": "12345",
    "created_at": "2020-11-24T08:16:48Z",
    "start_url": "https://zoom.us/s/94597936913?zak=eyJ6bV9za20iOiJ6bV9vMm0iLCJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJjbGllbnQiLCJ1aWQiOiJOS3d5VW5tVFFGdXdsaVcwVXUtZ2V3IiwiaXNzIjoid2ViIiwic3R5IjoxLCJ3Y2QiOiJhdzEiLCJjbHQiOjAsInN0ayI6IkYzY2UtZ2JSdFA5WE5Tb0RQX2lweDJROEhzX0NwRFA5eUlaUmZ0Wk95UVEuQUcuMnZLZDJLMnozZGI2QWNsTXdsaWR3YmZQbDhLVEE1b3A3OUNJSFlQSHRuTFlRY0RLNTJMT0pnNGhxb0RpSllBVmtmRFpKZFZYMVlud2dlay5KQVVERER5MDJGazZOM2xNVkxoREhBLkpGT21wbnRQZ3o5Z1VPaVIiLCJleHAiOjE2MDYyMTMwMDgsImlhdCI6MTYwNjIwNTgwOCwiYWlkIjoiRC0xMzZ4VldTMHVkNUtmMXBrMUtTUSIsImNpZCI6IiJ9.92phYEnbN2Q4HhjE2M6tGBGzcI76_RX7pi1HzwJOb0c",
    "join_url": "https://zoom.us/j/94597936913?pwd=cGoxNitNM2Y1QnVOYXNJWisrS2JIQT09",
    "password": "12345",
    "h323_password": "12345",
    "pstn_password": "12345",
    "encrypted_password": "cGoxNitNM2Y1QnVOYXNJWisrS2JIQT09",
    "settings": {
        "host_video": false,
        "participant_video": false,
        "cn_meeting": false,
        "in_meeting": false,
        "join_before_host": false,
        "mute_upon_entry": false,
        "watermark": false,
        "use_pmi": false,
        "approval_type": 2,
        "audio": "voip",
        "auto_recording": "none",
        "enforce_login": false,
        "enforce_login_domains": "",
        "alternative_hosts": "",
        "close_registration": false,
        "show_share_button": false,
        "allow_multiple_devices": false,
        "registrants_confirmation_email": true,
        "waiting_room": true,
        "request_permission_to_unmute_participants": false,
        "registrants_email_notification": true,
        "meeting_authentication": false,
        "encryption_type": "enhanced_encryption",
        "approved_or_denied_countries_or_regions": {
            "enable": false
        }
    }
}
*/
