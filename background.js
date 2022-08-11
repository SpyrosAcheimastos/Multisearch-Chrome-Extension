//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Filename: background.js
//  For: Multisearch_Chrome_Extension
//  Author: Spyros Acheimastos
//  Date: 02/08/2022
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Some default values for the popup window
let storageMainButtonClicked = "Custom";
let storageMSNsClicked = ["1002", "1003", "1004", "1007", "1012", "1013", "1014", "1019", "1022", "1023", "1024"];
let storageBookClicked = "Opt1";

// For the tab groups
let group_ID = 1312;
const GROUP_TITLE = ["Opt1", "Opt2"] 
const GROUP_COLOUR = ["yellow", "cyan"]

// Load data from JSON file
async function fetchJSON() {
    const response = await fetch('DATA_INPUT.json');
    const data = await response.json();
    return data;
}

// Load JSON and save to Storage every time background.js runs (for safety) 
// This can be merged with "chrome.runtime.onInstalled" if it is followed by async
main();
async function main() {
    // Get data from JSON file
    data = await fetchJSON()

    // Arrays used by popup.js
    const MSN_list = data.ALL;
    const NEW_MSN_list = data.NEW;
    const A320_MSN_list = data.A320;
    let A321_MSN_list = MSN_list.filter(x => !A320_MSN_list.includes(x));
    chrome.storage.sync.set({ MSN_list });
    chrome.storage.sync.set({ NEW_MSN_list });
    chrome.storage.sync.set({ A320_MSN_list });
    chrome.storage.sync.set({ A321_MSN_list });

    // Links used by background.js
    const linksOpt1 = data.Opt1;
    const linksOpt2 = data.Opt2;
    chrome.storage.sync.set({ linksOpt1 });
    chrome.storage.sync.set({ linksOpt2 });
}

// Some defaults for when installing the application
chrome.runtime.onInstalled.addListener(() =>{
    chrome.storage.sync.set({ storageMSNsClicked });
    console.log(`MSNs are ${storageMSNsClicked}`);

    chrome.storage.sync.set({ storageMainButtonClicked });
    console.log(`storageMainButtonClicked is  ${storageMainButtonClicked}`);

    chrome.storage.sync.set({ storageBookClicked });
    console.log(`storageBookClicked is  ${storageBookClicked}`);
});

// Main Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("background.js got a message");

    // Do nothing if Search Field is empty
    if (request.requestedSearch.length === 0) {return}

    // Open tabs
    open_ULRs(request.requestedSearch, request.requestedBook, request.requestedMSNs)
    .then((data) => {
        console.log("data = ", data);

        // Check Book
        let i = 0;
        if (request.requestedBook === "Opt2") { i = 1 }

        // Set Group colour and title
        let my_title = GROUP_TITLE[i] + " / " + request.requestedSearch
        chrome.tabGroups.update(data, {title: my_title, color: GROUP_COLOUR[i]});
    })
 });


async function open_ULRs(requestedSearch, requestedBook, requestedMSNs) {
    // Get the links from Storage
    let links = ""
    if (requestedBook === "Opt1") {
        links += "linksOpt1";
    } else {
        links += "linksOpt2";
    }
    const data = await chrome.storage.sync.get(links)

    // Counter
    let i = 0

    for (const [msn, link] of Object.entries(data[links])) {
        // To handle cases with MSNs starting with 0 (like 0835)
        // The "key" inside the JSON should be without the leading 0
        let temp_msn = ""
        if (msn.length === 3) {
            temp_msn = "0" + msn
        } else {
            temp_msn = msn
        }

        // Skip the links of the MSNs that where not selected
        if (!requestedMSNs.includes(temp_msn)) { continue }

        // Create the final URL using the user's search query
        let my_search = link + requestedSearch.replaceAll(" ","+");

        // Create a new tab
        let mytab = await chrome.tabs.create({url: my_search, active: false});

        // Find the group_ID of the first tab ELSE put all other tabs to that group
        if (i === 0) {
            group_ID = await chrome.tabs.group({tabIds: mytab.id});
        } else {
            await chrome.tabs.group({tabIds: mytab.id, groupId: group_ID});
        }

        // Counter
        i = i + 1
    }

    return group_ID;
};




