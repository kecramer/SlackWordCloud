var word_array = [
  {text: "Hack", weight: 14},
  {text: "Inference", weight: 15},
  {text: "Idiot", weight: 17},
  {text: "Idiosyncratic", weight: 9},
  {text: "Toaster", weight: 9},
  {text: "Couch", weight: 9},
  {text: "Sit", weight: 7},
  {text: "Lorem", weight: 15},
  {text: "Ipsum", weight: 9},
  {text: "Dolor", weight: 6},
  {text: "Toon", weight: 9},
  {text: "Terror", weight: 10},
  {text: "Task", weight: 8},
  {text: "Talent", weight: 9},
  {text: "Tea cup", weight: 13},
  {text: "Hasty", weight: 9},
  {text: "Harken", weight: 8},
  {text: "Heresy", weight: 20},
  {text: "Hantavirus", weight: 10},
  {text: "Amet", weight: 5}
];

// set default channel
let channel = "GAA4RPKRC";

$(document).ready(function() {
    console.log('app.js loaded!');

    // update channel when dropdown selection is made
    $('select').on('change', function() {
        channel = $('select option:selected')[0].value;
        console.log("Selected channel is now " + channel);
    });

    function handleError(err){
        console.log('There has been an error: ', err);
    }

    // Generate Word Cloud
    function initWordCloud (word_json) {
        let word_array = word_json.words;
        $("#wordcloud").jQCloud(word_array);
    }

    // Pull Word List (from the selected channel)
    $.ajax({
        method: 'GET',
        url: `/channel/${channel}/words?limit=200`,
        success: initWordCloud,
        error: handleError
    })




    // // Pull messages with the selected word

    // function renderMessage(messages) {
    //     // HTML Template
    //     const htmlToAppend = (`
    //         <div>
    //             <h4>${message.date}</h4>
    //             <h3>${message.user}</h3>
    //             <p>${message.text}</p>
    //         </div>
    //         `);
    //     // Append each message
    //     $('#results').append(htmlToAppend);
    // }

    // function renderAllMessages (messages) {
    //     // Clear previous results
    //     $('#results').html = '';
    //     // Add each message
    //     messages.forEach(function(message) {
    //       renderMessage(message);
    //     });
    // };


    // $( "span" ).on( "click", function( event ) {
    //     $.ajax({
    //         // event.preventDefault();
    //         method: 'GET',
    //         url: `/api/channels/${channel}/messages?q=` + response.innerText,
    //         success: function( response ) {
    //             let messages = response.messages
    //             console.log('There are ' + messages.length 'messages with this word.');
    //             renderAllMessages(messages);
    //         },
    //         error: handleError,
    //         beforeSend: function () {
    //             $('#results').append('Loading');
    //         },
    //         complete: function () {
    //             $('#loading').remove();
    //         }
    //     })
    // });


});

