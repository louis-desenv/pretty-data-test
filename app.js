// Load the Google API Client on page load
const spreadsheetId = "1fBtK-UTw0nDHb0RIXTcK55jWBZDzksPloGvgUBhLo0M";
const range = 'Sheet1!B2:B8'; 
let previousData = null;
var SCOPES = 'https://www.googleapis.com/auth/presentations.readonly';
var clientID = "558256588490-bsn7ie5om6ef41mkgcpf6ttuj3mov5hi.apps.googleusercontent.com";
let tokenClient;
let accessToken = null;




function handleAuth() {
  //alert("ok");
  google.accounts.oauth2.initTokenClient({
      client_id: clientID,
      scope: ' https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
          console.log('Access token:', response.access_token);
         accessToken=response.access_token;
          fetchDATA(response.access_token); 
      }
  }).requestAccessToken();
}


async function fetchDATA(token) {


  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});

if (!response.ok) {
    console.error('Error fetching data from Sheets:', response.statusText);
    return;
}
const data = await response.json();
console.log('Spreadsheet Data:', data.values);
var divID = pushDATA(data.values);
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

 function insertImageIntoSlide(presentationId, imageDataUrl) {

const requestBody = {
  requests: [{
          createImage: {
            url: imageDataUrl,
              elementProperties: {
                  pageObjectId: "g2fd223261d8_1_40", 
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
             
          }
      }]
  };
  const response =  fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
});


if (response.ok) {
    console.log("everythin all right");  
    
}
else{
    console.log("everythin all right");
    const errorResponse =  response.json(); // This will log the full error response from Google
    console.log('Google API Error Response:', errorResponse);
}


}

async function getFirstSlideId(presentationId) {
    try {
      // Fetch presentation metadata
      const response = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Check if there are slides and return the pageObjectId of the first slide
      if (data.slides && data.slides.length > 0) {
        const firstSlideId = data.slides[0].objectId;
        console.log(`First slide ID: ${firstSlideId}`);
        return firstSlideId;
      } else {
        throw new Error('No slides found in the presentation.');
      }
  
    } catch (error) {
      console.error('Error occurred:', error.message);
    }
  }

function captureAndInsert(presentationID,div) {
  //const div = document.getElementById(divID);

// Main workflow
html2canvas(div).then(canvas => {
  canvas.toBlob(async (blob) => {
      const fileId = await uploadToGoogleDrive(blob, 'image-from-canvas.png');
      await makeFilePublic(fileId);  // Make the file public
      const imageUrl = `https://drive.google.com/uc?id=${fileId}`;  // Public URL for the image
      await insertImageIntoSlide(presentationID, imageUrl);  // Insert the image into the slide
  }, 'image/png');
});

  // html2canvas(div).then(canvas => { 
  //     const imgData = canvas.toDataURL('image/png');


  //     insertImageIntoSlide(presentationID, imgData);
  // });
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



// setInterval(() => {
//   checkForChanges(SPREADSHEET_ID);
// }, 10000); // Check every 30 seconds 


async function uploadToGoogleDrive(blob, fileName) {
  const metadata = {
      name: fileName,
      mimeType: 'image/png'
  }; 

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
  formData.append('file', blob);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
          'Authorization': `Bearer ${accessToken}`
      }),
      body: formData
  });

  const fileData = await response.json();
  return fileData.id;  // Returns the file ID of the uploaded image
}

async function makeFilePublic(fileId) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          role: 'reader',
          type: 'anyone'
      })
  });
  return `https://drive.google.com/uc?id=${fileId}`;  // Returns the public URL of the image
}
