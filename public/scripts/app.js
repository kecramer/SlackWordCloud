// var word_array = [
//   {text: "Hack", weight: 14},
//   {text: "Inference", weight: 15},
//   {text: "Idiot", weight: 17},
//   {text: "Idiosyncratic", weight: 9},
//   {text: "Toaster", weight: 9},
//   {text: "Couch", weight: 9},
//   {text: "Sit", weight: 7},
//   {text: "Lorem", weight: 15},
//   {text: "Ipsum", weight: 9},
//   {text: "Dolor", weight: 6},
//   {text: "Toon", weight: 9},
//   {text: "Terror", weight: 10},
//   {text: "Task", weight: 8},
//   {text: "Talent", weight: 9},
//   {text: "Tea cup", weight: 13},
//   {text: "Hasty", weight: 9},
//   {text: "Harken", weight: 8},
//   {text: "Heresy", weight: 20},
//   {text: "Hantavirus", weight: 10},
//   {text: "Amet", weight: 5}
// ];

// set default channel
let channel = "GAA4RPKRC";

// create stopwords list
const stopwords = ["upload", "image", "uploaded", "ios", "commented", "file", "jpg", "a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "among", "an", "and", "another", "any", "anybody", "anyone", "anything", "anywhere", "are", "area", "areas", "around", "as", "ask", "asked", "asking", "asks", "at", "away", "b", "back", "backed", "backing", "backs", "be", "became", "because", "become", "becomes", "been", "before", "began", "behind", "being", "beings", "best", "better", "between", "big", "both", "but", "by", "c", "came", "can", "cannot", "case", "cases", "certain", "certainly", "clear", "clearly", "come", "could", "d", "did", "differ", "different", "differently", "do", "does", "done", "down", "down", "downed", "downing", "downs", "during", "e", "each", "early", "either", "end", "ended", "ending", "ends", "enough", "even", "evenly", "ever", "every", "everybody", "everyone", "everything", "everywhere", "f", "face", "faces", "fact", "facts", "far", "felt", "few", "find", "finds", "first", "for", "four", "from", "full", "fully", "further", "furthered", "furthering", "furthers", "g", "gave", "general", "generally", "get", "gets", "give", "given", "gives", "go", "going", "good", "goods", "got", "great", "greater", "greatest", "group", "grouped", "grouping", "groups", "h", "had", "has", "have", "having", "he", "her", "here", "herself", "high", "high", "high", "higher", "highest", "him", "himself", "his", "how", "however", "i", "if", "important", "in", "interest", "interested", "interesting", "interests", "into", "is", "it", "its", "itself", "j", "just", "k", "keep", "keeps", "kind", "knew", "know", "known", "knows", "l", "large", "largely", "last", "later", "latest", "least", "less", "let", "lets", "like", "likely", "long", "longer", "longest", "m", "made", "make", "making", "man", "many", "may", "me", "member", "members", "men", "might", "more", "most", "mostly", "mr", "mrs", "much", "must", "my", "myself", "n", "necessary", "need", "needed", "needing", "needs", "never", "new", "new", "newer", "newest", "next", "no", "nobody", "non", "noone", "not", "nothing", "now", "nowhere", "number", "numbers", "o", "of", "off", "often", "old", "older", "oldest", "on", "once", "one", "only", "open", "opened", "opening", "opens", "or", "order", "ordered", "ordering", "orders", "other", "others", "our", "out", "over", "p", "part", "parted", "parting", "parts", "per", "perhaps", "place", "places", "point", "pointed", "pointing", "points", "possible", "present", "presented", "presenting", "presents", "problem", "problems", "put", "puts", "q", "quite", "r", "rather", "really", "right", "right", "room", "rooms", "s", "said", "same", "saw", "say", "says", "second", "seconds", "see", "seem", "seemed", "seeming", "seems", "sees", "several", "shall", "she", "should", "show", "showed", "showing", "shows", "side", "sides", "since", "small", "smaller", "smallest", "so", "some", "somebody", "someone", "something", "somewhere", "state", "states", "still", "still", "such", "sure", "t", "take", "taken", "than", "that", "the", "their", "them", "then", "there", "therefore", "these", "they", "thing", "things", "think", "thinks", "this", "those", "though", "thought", "thoughts", "three", "through", "thus", "to", "today", "together", "too", "took", "toward", "turn", "turned", "turning", "turns", "two", "u", "under", "until", "up", "upon", "us", "use", "used", "uses", "v", "very", "w", "want", "wanted", "wanting", "wants", "was", "way", "ways", "we", "well", "wells", "went", "were", "what", "when", "where", "whether", "which", "while", "who", "whole", "whose", "why", "will", "with", "within", "without", "work", "worked", "working", "works", "would", "x", "y", "year", "years", "yet", "you", "young", "younger", "youngest", "your", "yours", "z"];



$(document).ready(() => {
    console.log('app.js loaded!');

    handleError = (err) => {
        console.log('There has been an error: ', err);
    }

    // Generate Word Cloud
    initWordCloud = (word_json) => {
        let word_array = word_json.words;
        word_array = word_array.filter(word => stopwords.indexOf(word.text)<0);
        // console.log(word_array);
        $("#wordcloud").jQCloud(word_array);
    }

    // Pull Word List (from the selected channel)
    const pullWordList = () => ($.ajax({
        method: 'GET',
        url: `/channel/${channel}/words?limit=200`,
        success: initWordCloud,
        error: handleError
    }));

    // // Populate list of channels in dropdown
    // renderChannel = (channel) => {
    //   // let username = response[0].name;
    //   // HTML Template
    //   const htmlToAppend = (`
    //       <option value="${channel.slack_id}"${($('#dropdown').html() === '') ? ' selected="selected"' : ''}>${channel.name}</option>
    //       `);
    //   // Append each message
    //   $('#dropdown').append(htmlToAppend);
    // }

    // renderAllChannels = (channels) => {
    //     // Clear previous results
    //     $('#dropdown').html('');
    //     // Add each message
    //     channels.forEach((channel) => {
    //       renderChannel(channel);
    //     });
    // };

    // $.ajax({
    //     // event.preventDefault();
    //     method: 'GET',
    //     url: `/channels`,
    //     success: (response) => {
    //         console.log(response);
    //         let channels = response.channels;
    //         renderAllChannels(channels);
    //     },
    //     error: handleError,
    // })    

    pullWordList();
    
    // update channel when dropdown selection is made
    $('select').on('change', () => {
        channel = $('select option:selected')[0].value;
        pullWordList;
        console.log("Selected channel is now " + channel);
    });




    // Pull messages with the selected word

    renderMessage = (message) => {
        $.ajax({
          method: 'GET',
          url: `/users?q=` + message.user,
          success: (response) => {
              let username = response[0].name;
              // HTML Template
              const htmlToAppend = (`
                  <div class="result">
                      <h4>${message.timestamp}</h4>
                      <h3>${username}</h3>
                      <p>${message.text}</p>
                  </div>
                  `);
              // Append each message
              $('#results').append(htmlToAppend);
          },
          error: handleError,
          }
        );

    }

    renderAllMessages = (messages) => {
        // Clear previous results
        $('#results').html('');
        // Add each message
        messages.forEach((message) => {
          renderMessage(message);
        });
    };

    // OnClick for each word in word cloud

    // let word_elements = $('span');
    // console.log(word_elements);
    $('#wordcloud').on('click', 'span', (event) => {
        console.log("clicked " + event.target.innerText);
        $.ajax({
            // event.preventDefault();
            method: 'GET',
            url: `/channel/${channel}/messages?q=` + event.target.innerText,
            success: (response) => {
                console.log(response);
                let messages = response.messages;
                renderAllMessages(messages);
            },
            error: handleError,
        })    

    });





});

