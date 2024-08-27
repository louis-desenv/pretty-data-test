

        // Load the Google API Client on page load
SPREADSHEET_ID= "1rjygC5Il0jA57UuVm_TQK268z3ydIyV7_JtU_IGPKL4";
const RANGE = 'Sheet1!A2:a8'; // Adjust the range according to your needs
const data = [100, 200, 150, 250, 180]; // Sample data

function loadGapiClient() {
    gapi.load('client:auth2', fetchDATA);
  }


function pushDATA(rowNumber, data){

    //const data = [100, 200, 150, 250, 180]; // Sample data

    const barChart = document.getElementById('barChart');

    data.values.forEach(value => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = value + 'px';

        const barText = document.createElement('p');
        barText.textContent = value;
        bar.appendChild(barText);

        barChart.appendChild(bar);
    });
  }

  function fetchDATA() {
    gapi.client.init({
      apiKey: 'AIzaSyBHJ0g53CuFKmpjmIxxxmdatmAE1w-s2y8',
    // clientId: '112296647260442305135.apps.googleusercontent.com',
      //discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
     //scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
    }).then(() => {
        return gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });
    }).then(response => {
        const result = response.result;
        const numRows = result.values ? result.values.length : 0;
        
        pushDATA(result,numRows);
            }
        );
    }
    
  window.onload = loadGapiClient;
