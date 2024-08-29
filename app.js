// Load the Google API Client on page load
const SPREADSHEET_ID = "1fBtK-UTw0nDHb0RIXTcK55jWBZDzksPloGvgUBhLo0M";
const RANGE = 'Sheet1!B2:B8'; // Adjust the range according to your needs
let previousData = null;

function loadGapiClient() {
    gapi.load('client', initializeGapiClient);
} 

function initializeGapiClient() {
    gapi.client.init({
        apiKey: 'AIzaSyBHJ0g53CuFKmpjmIxxxmdatmAE1w-s2y8',
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
    }).then(() => {
        fetchDATA();
    }).catch(error => {
        console.error('Error initializing GAPI client:', error);
    });
}

function fetchDATA() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
    }).then(response => {
        const result = response.result;
        previousData = response.result;
        const numRows = result.values ? result.values.length : 0;
        console.log(`${numRows} rows retrieved.`);
        pushDATA(result.values);
    }).catch(error => {
        console.error('Error fetching data:!', error);
        document.getElementById('barChart').innerText = error;
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
}

window.onload = loadGapiClient;

setInterval(() => {
  checkForChanges(SPREADSHEET_ID);
}, 10000); // Check every 30 seconds 


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
