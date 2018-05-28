var word_array = [
  {text: "Hack", weight: 14, html: 'class="clickable"'},
  {text: "Inference", weight: 15, html: 'class="clickable"'},
  {text: "Idiot", weight: 17, html: 'class="clickable"'},
  {text: "Idiosyncratic", weight: 9, html: 'class="clickable"'},
  {text: "Toaster", weight: 9, html: 'class="clickable"'},
  {text: "Couch", weight: 9, html: 'class="clickable"'},
  {text: "Sit", weight: 7, html: 'class="clickable"'},
  {text: "Lorem", weight: 15, html: 'class="clickable"'},
  {text: "Ipsum", weight: 9, html: 'class="clickable"'},
  {text: "Dolor", weight: 6, html: 'class="clickable"'},
  {text: "Toon", weight: 9, html: 'class="clickable"'},
  {text: "Terror", weight: 10, html: 'class="clickable"'},
  {text: "Task", weight: 8},
  {text: "Talent", weight: 9},
  {text: "Tea cup", weight: 13},
  {text: "Hasty", weight: 9},
  {text: "Harken", weight: 8},
  {text: "Heresy", weight: 20},
  {text: "Hantavirus", weight: 10},
  {text: "Amet", weight: 5}
];


$(document).ready(function() {
    console.log('app.js loaded!');

    //Once the AJAX get is working, this will be overwritten and can be removed
    $(function() {
        // When DOM is ready, select the container element and call the jQCloud method, passing the array of words as the first argument.
        $("#wordcloud").jQCloud(word_array);
    });


    function handleError(err){
        console.log('There has been an error: ', err);
    }

    function initWordCloud (word_array) {
        $("#wordcloud").jQCloud(word_array);
    }

    $.ajax({
        // event.preventDefault();
        method: 'GET',
        url: '/api/words',
        success: $(initWordCloud),
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
    //     messages.forEach(function(album) {
    //       renderMessage(album);
    //     });
    // };


    // $( "span" ).on( "click", function( event ) {
    //     $.ajax({
    //         // event.preventDefault();
    //         method: 'GET',
    //         url: '/api/messages?q=' + response.innerText,
    //         success: function( response ) {
    //             console.log('There are ' + response.length 'messages with this word.');
    //             renderAllMessages(response);
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

