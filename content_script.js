//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Filename: content_script.js
//  For: Multisearch_Chrome_Extension
//  Author: Spyros Acheimastos
//  Date: 02/08/2022
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let tmp = document.getElementsByName("q");

const my_regex = /MSN-\d{4}/g;

// Hacky way to update the names of the tabs to their respective MSN
for (let i = 0; i < 3; i++) {
    setTimeout(function (){
        try {
            starting_string = tmp[0].value;
            final_string = starting_string.match(my_regex)[0]
            givenName = final_string.slice(4)  
            document.title = givenName

        } catch (err) {}

    }, 1000*i);
}