/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

const LOCAL_KEYS = JSON.parse(window.localStorage.getItem("keys"));

// TODO(developer): Set to client ID and API key from the Developer Console
// const CLIENT_ID = "414014599007-m84b2c2lqecgkbvg800jmevmaq3ud6ht.apps.googleusercontent.com";
// const API_KEY = "AIzaSyBy-uE8BQI0DSq2XY_GjZ-24mzChJmmM9I";
// sheets id = "1VKIhuXhqNNvH1B7mh8DVyc6yJeHdXUTWJYtIWR9jm0s"

//if no local storage return 0 so functions dont fal, but no data will be found
const CLIENT_ID = LOCAL_KEYS === null ? "0" : LOCAL_KEYS.clientID;
const API_KEY = LOCAL_KEYS === null ? "0" : LOCAL_KEYS.APIKey;
const SHEETS_ID = LOCAL_KEYS === null ? "0" : LOCAL_KEYS.sheetsID;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";
document.getElementById("signout_button").style.visibility = "hidden";

//display new credential input if thre isnt local storage
LOCAL_KEYS === null
  ? ((document.getElementById("creds").style.display = "block"),
    (document.getElementById("new_creds").style.display = "none"))
  : ((document.getElementById("creds").style.display = "none"),
    (document.getElementById("new_creds").style.display = "block"));

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  LOCAL_KEYS !== null &&
    (await gapi.client.init({
      apiKey: [API_KEY],
      discoveryDocs: [DISCOVERY_DOC],
    }));
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("signout_button").style.visibility = "visible";
    document.getElementById("authorize_button").innerText = "Refresh";
    await returnSheetData();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("authorize_button").innerText = "Authorize";
    document.getElementById("signout_button").style.visibility = "hidden";
  }
}

document.getElementById("authorize_button").addEventListener("click", () => {
  handleAuthClick();
});

document.getElementById("signout_button").addEventListener("click", () => {
  handleSignoutClick;
});

/**
       * Print the names and majors of students in a sample spreadsheet:
       * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       * https://docs.google.com/spreadsheets/d/e/2PACX-1vToxQkM-8Z_nHqkR3WGRornbAs7nTOD-qBv8-u8QfGfG76EkWx97DhmFPuJHyUxJtqcidMNnZK5-cP8/pubhtml
       
dwr-uisce

https://docs.google.com/spreadsheets/d/1VKIhuXhqNNvH1B7mh8DVyc6yJeHdXUTWJYtIWR9jm0s/edit?usp=sharing
       */

//values.get === single range .bachGet === multiple rages
// async function returnSheetData() {
//   let response;
//   try {
//     // Fetch entire 'Data' sheet
//     response = await gapi.client.sheets.spreadsheets.values.get({
//       spreadsheetId: [SHEETS_ID],
//       range: "Data",
//     });
//   } catch (err) {
//     console.log(err.message);
//     return;
//   }
//   const values = response.result.values;
//   const range = response.result;
//   if (!range || !range.values || range.values.length == 0) {
//     console.log("No values found.");
//     return;
//   }
//   //   console.log(tsvToJson(values.slice(1, values.length), values[0]));
// }

const ranges = ["Data", "Project-Months", "WP details", "LinkedActivities"];

async function returnSheetData() {
  let response;
  try {
    // Fetch entire 'Data' sheet
    response = await gapi.client.sheets.spreadsheets.values.batchGet({
      spreadsheetId: [SHEETS_ID],
      ranges: ranges,
    });
  } catch (err) {
    console.log(err.message);
    return;
  }

  console.log(response);

  response.result.valueRanges.map((range, i) => {
    console.log(range);
    if (!range || !range.values || range.values.length == 0) {
      console.log("No values found for " + ranges[i]);
      return;
    }
  });
}

// add keys to local storage when clicked
document.getElementById("confirm").addEventListener("click", (e) => {
  const clientID = document.getElementById("client_ID").value;
  const APIKey = document.getElementById("API_key").value;
  const sheetsID = document.getElementById("sheets_id").value;

  const credentials = { clientID: clientID, APIKey: APIKey, sheetsID: sheetsID };
  window.localStorage.setItem("keys", JSON.stringify(credentials));

  document.getElementById("creds").style.display = "none";
  document.getElementById("new_creds").style.display = "block";
});

document.getElementById("new_creds").addEventListener("click", () => {
  window.localStorage.removeItem("keys");
  document.getElementById("creds").style.display = "block";
  document.getElementById("new_creds").style.display = "none";
});

//turns array of headings and data to JSON object
function tsvToJson(d, keys) {
  console.log(d);
  const JSON = [];
  for (var i = 0; i < d.length; i++) {
    var data = {};
    for (var j = 0; j < keys.length; j++) {
      data[keys[j]] = d[i][j];
    }
    JSON.push(data);
  }
  return JSON;
}
