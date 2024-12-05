// Load the Google API Client on page load
const spreadsheetId = "1fBtK-UTw0nDHb0RIXTcK55jWBZDzksPloGvgUBhLo0M";
const range = 'Sheet1!B2:B8'; 
let previousData = null;
var SCOPES = 'https://www.googleapis.com/auth/presentations.readonly';
var clientID = "1649941521-cpoo9qbtol2lgvblt87nc4olp9ptjn67.apps.googleusercontent.com";
let tokenClient;
let accessToken = null;

function TestUploadFile(div,folderId) {
  //const div = document.getElementById(divID);

// Main workflow
html2canvas(div).then(canvas => {
  canvas.toBlob(async (blob) => {
       await uploadToGoogleDrive(blob, 'image-from-canvas.png',folderId);
   // Public URL for the image
   }, 'image/png');
});
}


function createAndReadFolder(accessToken) {
  // URL for Google Drive API
  const url = 'https://www.googleapis.com/drive/v3/files';

  // Metadata for creating a new folder
  const folderMetadata = {
      name: "My App Folder 1vvvvv0",
      mimeType: "application/vnd.google-apps.folder" // Identifies the file as a folder
  };

  // Step 1: Create the folder
  fetch(url, {
      method: "POST",
      headers: {
          "Authorization": `Bearer ${accessToken}`, // Use the access token
          "Content-Type": "application/json"
      },
      body: JSON.stringify(folderMetadata)
  })
  .then(response => response.json())
  .then(data => {
      if (data.id) {
         // console.log(`Folder created successfully with ID: ${data.id}`);

          TestUploadFile(barChart,data.id);

          // Step 2: Read files inside the folder
          const folderId = data.id;
          const listFilesUrl = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)`;

          return fetch(listFilesUrl, {
              method: "GET",
              headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
              }
          });
      } else {
          throw new Error("Failed to create folder");
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.files && data.files.length > 0) {
          console.log("Files in folder:");
          data.files.forEach(file => {
              console.log(`Name: ${file.name}, ID: ${file.id}, MimeType: ${file.mimeType}`);
          });
      } else {
        //  console.log("The folder is empty or no files were found.");
      }
  })
  .catch(error => {
      console.error("Error during folder creation or reading files:", error);
  });
}

async function handleAuth() {
  //alert("ok");
  google.accounts.oauth2.initTokenClient({
      client_id: clientID,
      //scope: ' https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.file',
      scope: 'https://www.googleapis.com/auth/drive.file',
      access_type: 'offline', // Request offline access
      prompt: 'consent',      // Ensure the user consents to offline access
  
      callback: (response) => {
          console.log('Access token:', response.access_token);
         accessToken=response.access_token;
          //fetchDATA(response.access_token); 
           // Call the Cloud Function
           callCloudFunction(accessToken);
          createAndReadFolder(accessToken);
      }
  }).requestAccessToken();
}

async function callCloudFunction(accessToken) {
  try {
      const cloudFunctionURL = 'https://savetoken-1649941521.us-central1.run.app'; // Replace with your function's URL

      const response = await fetch(cloudFunctionURL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              token: accessToken
          }),
      });

      if (!response.ok) {
          throw new Error(`Cloud Function call failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Cloud Function Response:', result);
  } catch (error) {
      console.error('Error calling Cloud Function:', error);
  }
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
    console.log("error");
   
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
  // Step 1: Prompt the user for the folder name
  const folderName = prompt("Enter the folder name where the file will be uploaded:");

  if (!folderName) {
      alert("No folder name provided. File upload canceled.");
      return;
  }

  // Step 2: Find the folder by its name
  const searchFolderResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder'&fields=files(id,name)`, {
      method: 'GET',
      headers: new Headers({
          'Authorization': `Bearer ${accessToken}`
      })
  });

  const folderData = await searchFolderResponse.json();

  if (!folderData.files || folderData.files.length === 0) {
      alert(`Folder with name "${folderName}" not found.`);
      return;
  }

  const folderId = folderData.files[0].id; // Assume the first match is the correct folder
  console.log(`Folder found: ${folderName} , the  ID is: ${folderId}`);

  // Step 3: Upload the file to the found folder
  const metadata = {
      name: fileName,
      mimeType: 'image/png',
      parents: [folderId] // Use the found folder ID
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', blob);

  const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({
          'Authorization': `Bearer ${accessToken}`
      }),
      body: formData
  });

  const fileData = await uploadResponse.json();

  if (uploadResponse.ok) {
      alert(`File uploaded successfully!!!`);
      console.log(`File uploaded successfully!!!  with ID: ${fileData.id}`);
      return fileData.id; // Returns the file ID of the uploaded image
  } else {
      console.error('Error uploading file:', fileData);
      alert(`Failed to upload file: ${fileData.error?.message || 'Unknown error'}`);
  }
}