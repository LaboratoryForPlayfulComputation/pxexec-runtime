import * as fs from "fs";
import { env } from "./core-exec";

// Google stuff
import google = require('googleapis');


let token: any;
let credentials: any;

let oAuth2Client: any;

// parse token.js and credentials.js
export function initialize() {
    const tokenPath = env.GOOGLE_TOKEN_PATH;
    const credPath = env.GOOGLE_CREDENTIAL_PATH;

    const tokenFile = fs.readFileSync(tokenPath, 'utf8');
    const credFile = fs.readFileSync(credPath, 'utf8');

    token = JSON.parse(tokenFile);
    credentials = JSON.parse(credFile);

    const { client_secret, client_id, redirect_uris } = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    return;
}

// Exported Class Spreadsheet
//   Methods to append row
//   Clear Sheet
//   Read Row
//   Read Cell

export class Spreadheet {

    private spreadsheetID: string;
    private name: string;

    constructor(spreadsheetID: string, name: string) {
        this.spreadsheetID = spreadsheetID;
        this.name = name;
    }

    public clearSheet() {
        const sheets = google.sheets({ version: 'v4', oAuth2Client });

        sheets.spreadsheets.values.clear({
            range: name,
            spreadsheetId: this.spreadsheetID,
        }, (err, result) => {
            if (err) {
                // Handle error.
                console.log(err);
            } else {
                console.log(`${result.data} cells cleared.`);
            }
        });
    }

}


// Factory Method to create spreadsheet by name, return spreadsheet class
/*
export function createSheet(name: string) {
    return new Spreadsheet()
}

// Factory method to get spreadsheet from ID, return spreadsheet class
export function getSheet(id: string) {

}
*/