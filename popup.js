//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Filename: popup.js
//  For: Airbus_Extension
//  Author: Spyros Acheimastos
//  Date: 02/08/2022
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const button_list = [
    "All",
    "New",
    "Custom",
    "A320",
    "A321",
    "Clear"
]

// CSS Classes
const msnButton = "msn-btn"
const mainButton = "main-btn"
const selectedMainButton = "selectedMainButton"
const selectedMSNButton = "selectedMSNButton"

// For chrome.storage.sync
const storageMainButtonClicked = "storageMainButtonClicked"
const storageMSNsClicked = "storageMSNsClicked"
const storageBookClicked = "storageBookClicked"

// For divs that contain the constructed buttons
const containerMainButtons = document.getElementById("containerMainButtons");
const containerMSNs = document.getElementById("containerMSNs");

// For Search Field, Search Button, and Switch
const searchField = document.getElementById("searchField");
const searchButton = document.getElementById("searchButton");
const bookSwitch = document.getElementById("bookSwitch");
// -------------------------------------------------------------------------------

function areEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    };
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i])) {
            return false;
        };
    };
    return true;
};

function clickMainButton(e) {
    let newList = []
    if (e.target.id === "All") {
        newList = MSN_list;
    } else if (e.target.id === "New") {
        newList = NEW_MSN_list;
    } else if (e.target.id === "A320" ) {
        newList = A320_MSN_list;
    } else if (e.target.id === "A321") {
        newList = A321_MSN_list;
    } else if (e.target.id === "Clear") {
        newList = [];
    } else {
        return
    }

    // Deselect All MSNs Buttons
    for (i = 0; i < MSN_list.length; i++) {
        document.getElementById(MSN_list[i]).classList.remove(selectedMSNButton)
    }

    // Select only the MSNs Buttons that where selected from Main Button
    for (i = 0; i < newList.length; i++) {
        document.getElementById(newList[i]).classList.add(selectedMSNButton)
    }
    
    // Find all the selected MSNs and SET to storage
    let clickedMSNs = []
    const allElementsClicked = document.getElementsByClassName(selectedMSNButton);
    for (i = 0; i < allElementsClicked.length; i++) {
        clickedMSNs.push(allElementsClicked[i].innerHTML);
    };
    chrome.storage.sync.set({ storageMSNsClicked: clickedMSNs });
    
    // Deselect all Main Buttons
    for (i = 0; i < button_list.length; i++) {
        console.log(`button_list[i] = ${button_list[i]}`)
        document.getElementById(button_list[i]).classList.remove(selectedMainButton)
    }

    // Select the Main Button that was selected
    if (e.target.id !== "Clear") {
        e.target.classList.add(selectedMainButton);
        chrome.storage.sync.set({ storageMainButtonClicked: e.target.id });
    } else {
        chrome.storage.sync.set({ storageMainButtonClicked: "-" });
    }
};

function clickMSN(e) {
    // Toggle if a MSN is selected 
    e.target.classList.toggle(selectedMSNButton);

    // Find all the selected MSNs and SET to storage
    let clickedMSNs = []
    const allElementsClicked = document.getElementsByClassName(selectedMSNButton);
    for (i = 0; i < allElementsClicked.length; i++) {
        clickedMSNs.push(allElementsClicked[i].innerHTML);
    };
    // console.log(`NEW clickedMSNs = ${clickedMSNs}`);
    chrome.storage.sync.set({ storageMSNsClicked: clickedMSNs });

    // Deselect all Main Buttons
    const allMainButtons = document.getElementsByClassName(selectedMainButton);
    for (i = 0; i < allMainButtons.length; i++) {
        allMainButtons[i].classList.remove(selectedMainButton);
    };

    // Check which Main Buttons to select
    let clickedMainButton = ""
    if (areEqual(clickedMSNs, MSN_list)) {
        clickedMainButton += "All"
    } else if (areEqual(clickedMSNs, NEW_MSN_list)) {
        clickedMainButton += "New"
    } else if (areEqual(clickedMSNs, A320_MSN_list)) {
        clickedMainButton += "A320"
    } else if (areEqual(clickedMSNs, A321_MSN_list)) {
        clickedMainButton += "A321"
    } else if (clickedMSNs.length === 0) {
        console.log("clickedMSNs array is Empty")
    } else {
        clickedMainButton += "Custom"
    }

    if (clickedMainButton.length !== 0 ) {
        document.getElementById(clickedMainButton).classList.add(selectedMainButton);
        chrome.storage.sync.set({ storageMainButtonClicked: clickedMainButton });
    } else {
        chrome.storage.sync.set({ storageMainButtonClicked: "-" });
    }
};

function constructMainButtons(button_list) {
    chrome.storage.sync.get(storageMainButtonClicked, (data) => {
        for (let main of button_list) {
            // Create Main Button
            const button = document.createElement("button");
            button.classList.add(mainButton)
            button.innerHTML += main;
            button.id = main
            
            // Add class for Custom and Clear Buttons
            if (main === "Custom") {
                button.classList.add("custom-btn");
            } else if (main === "Clear") {
                button.classList.add("clear-btn");
            }

            // If in storage add "selected" Class
            if (data.storageMainButtonClicked === main) {
                button.classList.add(selectedMainButton);
            } 
            
            // Add Event Listener and append Button to Div
            button.addEventListener("click", clickMainButton);
            containerMainButtons.appendChild(button);
        };
    });
};

function constructMSNButtons(MSN_list) {
    chrome.storage.sync.get(storageMSNsClicked, (data) => {
        for (let MSN of MSN_list) {
            // Create MSN button
            const button = document.createElement("button");
            button.classList.add(msnButton)
            button.innerHTML += MSN;
            button.id = MSN
            
            // Add class for A320 or A321
            if (A320_MSN_list.includes(MSN)) {
                button.classList.add("A320");
            } else {
                button.classList.add("A321");
            }

            // If in storage add "selected" Class
            if (data.storageMSNsClicked.includes(MSN)) {
                button.classList.add(selectedMSNButton);
                console.log(`To MSN ${MSN} einai mesa`);
            } 
            
            // Add Event Listener and append Button to Div
            button.addEventListener("click", clickMSN);
            containerMSNs.appendChild(button);
        };
    });
};

function constructBookSwitch() {
    chrome.storage.sync.get(storageBookClicked, (data) => {
        // const bookSwitch = document.getElementById("bookSwitch");

        // Check if Opt2 is in Strorage
        if (data.storageBookClicked === "Opt2") {
            bookSwitch.checked = true
        } else {
            bookSwitch.checked = false
        }
        
        // Add Event Listener
        bookSwitch.addEventListener("click", clickBookSwitch);
    });
};

function clickBookSwitch(e) {
    let selection = ""
    if (e.target.checked == true) {
        selection += "Opt2"
    } else {
        selection += "Opt1"
    }

    // Save selection to Storage
    chrome.storage.sync.set({ storageBookClicked: selection})
};

// -------------------------------------------------------------------------------

// For the Search Field
searchField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

// For the Search Button 
searchButton.addEventListener("click", function(event) {
    // Get what the user has selected
    const requestedSearch = searchField.value;
    const selectedBook = bookSwitch.checked;
    const selectedMSNs = document.getElementsByClassName(selectedMSNButton);

    let requestedBook = ""
    if (selectedBook == true) {
        requestedBook += "Opt2"
    } else {
        requestedBook += "Opt1"
    }

    let requestedMSNs = []
    for (i = 0; i < selectedMSNs.length; i++) {
        requestedMSNs.push(selectedMSNs[i].innerHTML)
    }

    // Send message to "background.js"
    let message = {requestedSearch, requestedBook, requestedMSNs};
    chrome.runtime.sendMessage(message);
});


// Start with loadind from Storage and then constructing the Buttons
chrome.storage.sync.get(["MSN_list", "NEW_MSN_list", "A321_MSN_list", "A320_MSN_list"], (data) => {

    // Set GLOBAL variables
    window.MSN_list = data.MSN_list;
    window.NEW_MSN_list = data.NEW_MSN_list;
    window.A321_MSN_list = data.A321_MSN_list;
    window.A320_MSN_list = data.A320_MSN_list;

    constructBookSwitch();
    constructMainButtons(button_list);
    constructMSNButtons(MSN_list);
});