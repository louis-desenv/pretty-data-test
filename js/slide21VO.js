document.addEventListener("DOMContentLoaded", function() {
    // Access the grid-container div
    
    const gridContainer = document.querySelector('.grid-container');
    const gridContainerBottom = document.querySelector('.grid-container-bottom');

    // Check if gridContainer is not null
    if (gridContainer) {
        // Create columns dynamically
        
        for (let i = 0; i < 4; i++) { 
           
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('column');
           
            const itemUpDiv = document.createElement('div');
            itemUpDiv.classList.add('item-up');
            itemUpDiv.textContent = '1'; // Add content to item-up
            itemUpDiv.style.width =Math.floor(Math.random() * 100+12)+ "px" ;           
            columnDiv.appendChild(itemUpDiv);

            gridContainer.appendChild(columnDiv);
        }
    } else {
        console.error("grid-container element not found");
    }

     // Check if gridContainerBottom is not null
     if (gridContainerBottom) {
        // Create columns dynamically
        
        for (let i = 0; i < 4; i++) { 
           
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('column');

            const itemDownDiv = document.createElement('div');
            itemDownDiv.classList.add('item-down');
            itemDownDiv.textContent = '2'; // Add content to item-down
           columnDiv.appendChild(itemDownDiv);            
            gridContainerBottom.appendChild(columnDiv);
        }
    } else {
        console.error("grid-container-bottom element not found");
    }
});
