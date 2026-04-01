import { google } from 'googleapis'

function getAuthClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/meetings.space.created'],
    clientOptions: {
      subject: process.env.GOOGLE_MEET_IMPERSONATE_EMAIL, // admin@sciquestlearning.com
    },
  })
  return auth
}

export async function createGoogleMeetSpace(): Promise<string> {
  const auth = getAuthClient()
  const meet = google.meet({ version: 'v2', auth })
  const res = await meet.spaces.create({ requestBody: {} })
  const meetingUri = res.data.meetingUri
  if (!meetingUri) throw new Error('Google Meet API did not return a meeting URI')
  return meetingUri
}
