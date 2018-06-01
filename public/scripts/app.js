// set default channel
let channel = "GAA4RPKRC";
let savedMessages = [];

// create stopwords list
const stopwords = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "upload", "image", "uploaded", "ios", "commented", "file", "jpg", "a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone", "along", "already", "also", "although", "always", "among", "an", "and", "another", "any", "anybody", "anyone", "anything", "anywhere", "are", "area", "areas", "around", "as", "ask", "asked", "asking", "asks", "at", "away", "b", "back", "backed", "backing", "backs", "be", "became", "because", "become", "becomes", "been", "before", "began", "behind", "being", "beings", "best", "better", "between", "big", "both", "but", "by", "c", "came", "can", "cannot", "case", "cases", "certain", "certainly", "clear", "clearly", "come", "could", "d", "did", "differ", "different", "differently", "do", "does", "done", "down", "down", "downed", "downing", "downs", "during", "e", "each", "early", "either", "end", "ended", "ending", "ends", "enough", "even", "evenly", "ever", "every", "everybody", "everyone", "everything", "everywhere", "f", "face", "faces", "fact", "facts", "far", "felt", "few", "find", "finds", "first", "for", "four", "from", "full", "fully", "further", "furthered", "furthering", "furthers", "g", "gave", "general", "generally", "get", "gets", "give", "given", "gives", "go", "going", "good", "goods", "got", "great", "greater", "greatest", "group", "grouped", "grouping", "groups", "h", "had", "has", "have", "having", "he", "her", "here", "herself", "high", "high", "high", "higher", "highest", "him", "himself", "his", "how", "however", "i", "if", "important", "in", "interest", "interested", "interesting", "interests", "into", "is", "it", "its", "itself", "j", "just", "k", "keep", "keeps", "kind", "knew", "know", "known", "knows", "l", "large", "largely", "last", "later", "latest", "least", "less", "let", "lets", "like", "likely", "long", "longer", "longest", "m", "made", "make", "making", "man", "many", "may", "me", "member", "members", "men", "might", "more", "most", "mostly", "mr", "mrs", "much", "must", "my", "myself", "n", "necessary", "need", "needed", "needing", "needs", "never", "new", "new", "newer", "newest", "next", "no", "nobody", "non", "noone", "not", "nothing", "now", "nowhere", "number", "numbers", "o", "of", "off", "often", "old", "older", "oldest", "on", "once", "one", "only", "open", "opened", "opening", "opens", "or", "order", "ordered", "ordering", "orders", "other", "others", "our", "out", "over", "p", "part", "parted", "parting", "parts", "per", "perhaps", "place", "places", "point", "pointed", "pointing", "points", "possible", "present", "presented", "presenting", "presents", "problem", "problems", "put", "puts", "q", "quite", "r", "rather", "really", "right", "right", "room", "rooms", "s", "said", "same", "saw", "say", "says", "second", "seconds", "see", "seem", "seemed", "seeming", "seems", "sees", "several", "shall", "she", "should", "show", "showed", "showing", "shows", "side", "sides", "since", "small", "smaller", "smallest", "so", "some", "somebody", "someone", "something", "somewhere", "state", "states", "still", "still", "such", "sure", "t", "take", "taken", "than", "that", "the", "their", "them", "then", "there", "therefore", "these", "they", "thing", "things", "think", "thinks", "this", "those", "though", "thought", "thoughts", "three", "through", "thus", "to", "today", "together", "too", "took", "toward", "turn", "turned", "turning", "turns", "two", "u", "under", "until", "up", "upon", "us", "use", "used", "uses", "v", "very", "w", "want", "wanted", "wanting", "wants", "was", "way", "ways", "we", "well", "wells", "went", "were", "what", "when", "where", "whether", "which", "while", "who", "whole", "whose", "why", "will", "with", "within", "without", "work", "worked", "working", "works", "would", "x", "y", "year", "years", "yet", "you", "young", "younger", "youngest", "your", "yours", "z", "channel", "joined", "left"];


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

    // Populate list of channels in dropdown
    renderChannel = (channel) => {
        // HTML Template
        let htmlToAppend = (`
            <option value="${channel.slack_id}"${($('#select').html() === '') ? ' selected="selected"' : ''}>${channel.name}</option>
            `);
        // Append each message
        $('#select').append(htmlToAppend);
    }

    renderAllChannels = (channels) => {
        // Clear previous results
        $('#select').html('');
        // Add each message
        channels.forEach((channel) => {
            renderChannel(channel);
        });
    };

    $.ajax({
        method: 'GET',
        url: `/channels`,
        success: (response) => {
            console.log(response);
            let channels = response.channels;
            renderAllChannels(channels);
        },
        error: handleError,
    })

    pullWordList();

    // update channel when dropdown selection is made
    $('select').on('change', () => {
        // Clear previous results
        $('#results').html('');
        // update channel
        channel = $('select option:selected')[0].value;
        $('#wordcloud').html('');
        pullWordList();
        console.log("Selected channel is now " + $('select option:selected')[0].innerText);
    });




    // Pull messages with the selected word

    renderMessage = (message) => {
        $.ajax({
            method: 'GET',
            url: `/users?q=` + message.user,
            success: (response) => {
            	const messageId = message._id;
                const username = response[0].name ? response[0].name : "A ghost of slack past";
                const datetime = new Date(message.timestamp);
                let saveStatus = savedMessages.indexOf(messageId) >= 0 ? 'Unsave' : 'Save';
                
                // HTML Template
                const htmlToAppend = (`
                    <div data-msg-id="${messageId}" class="result">
                        <h4 title="${datetime.toLocaleTimeString()}">${datetime.toLocaleDateString()}</h4>
                        <h3>${username}</h3>
                        <p>${slackdown.parse(message.text)}</p>
                        <a href="#"><h5>${saveStatus}</h5></a>
                    </div>
                    `);

                // Append message
                $('#results').append(htmlToAppend);

                // Add onclick for saving messages
                $('#results .result:last-child').on('click', 'a>h5', (event) => {
                    event.preventDefault();

		            // Establish variables
		            const wordCloudButton = event.target;
		            let saveState = wordCloudButton.innerText;
		            const wordCloudCopy = $(wordCloudButton).parent().parent();
		            const savedMessageCopy = wordCloudCopy.clone();

                    // function to DELETE message from backend
                    const deleteFromBackEnd = () => {
                        $.ajax({
                            method: 'DELETE',
                            url: `/messages/${messageId}`,
                            success: function(message) {
                                console.log("message deleted from saved in database");

                                // delete message from savedMessages array
                                let index = savedMessages.indexOf(messageId);
								if (index > -1) {
								  savedMessages.splice(index, 1);
								}
                            },
                            error: handleError
                        });
                        $().remove();
                    }

                    // function to remove message
                    const removeMessage = () => {
                        console.log("clicked to unsave message");

                        // DELETE message from frontend
                        $('#savedmessages>div').attr('data-msg-id', messageId).remove();

                        // DELETE message from backend
                        deleteFromBackEnd()
                        saveState = 'Save'
                        wordCloudButton.innerText = saveState;
                    }

                    // Update Save State
                    if (saveState === 'Save') {
						console.log("clicked to save message");

						// POST message to backend
						$.ajax({
						    method: 'POST',
						    url: `/messages/${messageId}`,
						    data: `{message: ${messageId}}`,
						    success: function(message) {
						        console.log("message saved to database");
						        savedMessages.push(messageId);
						    },
						    error: handleError
						});

						// Add message to saved tab
						savedMessageCopy.appendTo('#savedmessages');

						// Add OnClick to savedMessageCopy for removal
						$(savedMessageCopy).on('click', (event) => {
					        event.preventDefault();
					        removeMessage();
						})

						saveState = 'Unsave';
						wordCloudButton.innerText = saveState;;
						savedMessageCopy.find('h5')[0].innerHTML = saveState;
                    } else {
                        console.log("clicked to unsave message");
                        removeMessage();
                    }
                        

                })
            },
            error: handleError
        });
    }

    renderAllMessages = (messages) => {
        // Clear previous results
        $('#results').html('');
        // Add each message
        messages.forEach((message) => {
            renderMessage(message);
        });
    };

     insertionQ('.slack-user').every((el) => {
        if(el.innerText.indexOf('@') > -1)
            {
                return;
            }
        $.ajax({
            method: 'GET',
            url: '/users?q=U' + el.innerText,
            success: (res) => {
                el.innerText = `@${res[0].handle}`;
            }
        });
     });

    // OnClick for each word in word cloud
    $('#wordcloud').on('click', 'span', (event) => {
        console.log("clicked " + event.target.innerText);
        $.ajax({
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

    // OnClick for navbar
    $('nav').on('click', 'a>h3', (event) => {
        event.preventDefault();
        let element = event.target;
        console.log("clicked " + element.innerText);
        if (element.className === 'savedmessages') {
            $('main#words').addClass('hidden');
            $('main#saved').removeClass('hidden');
            $('.wordcloud').removeClass('tab');
            $('.savedmessages').addClass('tab');
        } else {
            $('main#saved').addClass('hidden');
            $('main#words').removeClass('hidden');
            $('.savedmessages').removeClass('tab');
            $('.wordcloud').addClass('tab');
        }
    });

});
