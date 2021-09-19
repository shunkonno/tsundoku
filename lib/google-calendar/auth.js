const fs = require('fs').promises;
const { google } = require('googleapis');

const getOAuth2Client = async () => {
    const credentialsText = await fs.readFile('credentials.json', 'utf-8');
    const credentials = JSON.parse(credentialsText);

    const tokenText = await fs.readFile('token.json', 'utf-8');
    const token = JSON.parse(tokenText);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

module.exports = getOAuth2Client;