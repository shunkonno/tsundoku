const { google } = require('googleapis');
const getOAuth2Client = require('./auth');

module.exports = (async (event) => {
    console.log('Create Event captured:');
    console.log(event);

    const auth = await getOAuth2Client(); // 認証クライアント取得

    const calendar = google.calendar({ version: 'v3', auth }); // カレンダーAPI連携用クライアント取得
    const response = await calendar.events.insert({
        auth,
        calendarId: 'primary',
        resource: event,
    });

    console.log('Event created:', response);
})()