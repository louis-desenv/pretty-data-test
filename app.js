// Load the Google API Client on page load
const spreadsheetId = "1fBtK-UTw0nDHb0RIXTcK55jWBZDzksPloGvgUBhLo0M";
const range = 'Sheet1!B2:B8'; // Adjust the range according to your needs
let previousData = null;
var SCOPES = 'https://www.googleapis.com/auth/presentations.readonly';
var clientID = "558256588490-bsn7ie5om6ef41mkgcpf6ttuj3mov5hi.apps.googleusercontent.com";
let tokenClient;
let accessToken = null;


function handleAuth() {
  google.accounts.oauth2.initTokenClient({
      client_id: 'clientID.apps.googleusercontent.com',
      scope: ' https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/spreadsheets.readonly',
      callback: (response) => {
          console.log('Access token:', response.access_token);
          accessToken=response.access_token;
          fetchDATA(); 
      }
  }).requestAccessToken();
}


async function fetchDATA() {


  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});

if (!response.ok) {
    console.error('Error fetching data from Sheets:', response.statusText);
    return;
}
const data = await response.json();
console.log('Spreadsheet Data:', data.values);
var divID = pushDATA(result.values);
captureAndInsert("1rjygC5Il0jA57UuVm_TQK268z3ydIyV7_JtU_IGPKL4",divID);

/*

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    }).then(response => {
        const result = response.result;
        previousData = response.result;
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        var divID = pushDATA(result.values);
      captureAndInsert("1rjygC5Il0jA57UuVm_TQK268z3ydIyV7_JtU_IGPKL4",divID);
    }).catch(error => {
        console.error('Error fetching data:!', error);
        document.getElementById('barChart').innerText = error;
    });

    */
}

async function insertImageIntoSlide(presentationId, imageDataUrl) {

  

const requestBody = {
  requests: [{
          createImage: {
              elementProperties: {
                  pageObjectId: 'p2', 
                  size: {
                      height: {
                          magnitude: 400,
                          unit: 'PT'
                      },
                      width: {
                          magnitude: 600,
                          unit: 'PT'
                      }
                  },
                  transform: {
                      scaleX: 1,
                      scaleY: 1,
                      translateX: 0,
                      translateY: 0,
                      unit: 'PT'
                  }
              },
              imageUrl: imageDataUrl
          }
      }]
  };
  const response = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
});


}

function captureAndInsert(presentationID,div) {
  //const div = document.getElementById(divID);
  html2canvas(div).then(canvas => { 
      const imgData = canvas.toDataURL('image/png');
      insertImageIntoSlide(presentationID, imgData);
  });
}

function pushDATA(data) {
    const barChart = document.getElementById('barChart');
    barChart.innerHTML = ''; // Clear any existing content

    data.forEach(value => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = value[0] + 'px'; // Accessing the first element of the row

        const barText = document.createElement('p');
        barText.textContent = value[0];
        bar.appendChild(barText);

        barChart.appendChild(bar);


    });
    return barChart;
}

window.onload = handleAuth();

// setInterval(() => {
//   checkForChanges(SPREADSHEET_ID);
// }, 10000); // Check every 30 seconds 


function checkForChanges(spreadsheetId) {
  gapi.client.sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  }).then((response) => {
    const newData = response.result;
    if (previousData && JSON.stringify(previousData) !== JSON.stringify(newData)) {
      console.log("Spreadsheet data changed!");
      // Handle the detected change
      const result = response.result;
      pushDATA(result.values);

    }
    else{
      console.log("Spreadsheet didnt changed!");
    }
    
  });

}
