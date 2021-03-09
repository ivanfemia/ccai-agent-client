/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

function submit_message(message) {
    $.post( "/send_message", {message: message, session_id:session_id}, handle_response);

    function handle_response(data) {
        session_id = data.session_id
        response = JSON.parse(data.message)
        response.messages.forEach(function(message) {
            if ( message.hasOwnProperty('text') ) {
                renderText(message.text);
            } else if ( message.hasOwnProperty('payload') ) {
                renderPayload(message.payload);
            }
            $('#chat-container').animate({ scrollTop: $('#chat-container').prop("scrollHeight")}, 1000);
        });
    }
}

function renderText(message) {
    if ( message.hasOwnProperty('text') ) {
        message.text.forEach(function(text) {
            // append the bot repsonse to the div
            $('.chat-container').append(`
                <div class="chat-message col-md-5 offset-md-7 bot-message">
                    ${text}
                </div>
            `)
        });
        // remove the loading indicator
        $( "#loading" ).remove();
    }
}

function renderPayload(message) {
    if ( message.hasOwnProperty('richContent') ) {
        message.richContent.forEach(function(richContent) {
            var response = '';
            richContent.forEach((val, key, arr) => {
                if (Object.is(0, key)) {
                    response = response.concat(`<div class="chat-message col-md-5 offset-md-7 bot-messagepayload">`);
                }
                if (val.type == 'list') {
                    subtitle = ``
                    if (val.subtitle) { subtitle = `<div class="chat-subtitle">${val.subtitle}</div>`; }
                    response = response.concat(`<a class="btn btn-primary bot-action" href="#" role="button">${val.title}&nbsp;<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-reply-fill" viewBox="0 0 16 16"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>${subtitle}</a>`);
                }
                if (val.type == 'divider') {
                    response = response.concat(`<div class="chat-divider"/>`);
                }
                if (Object.is(arr.length - 1, key)) {
                    response = response.concat(`</div>`);
                }
            });
            $('.chat-container').append(response);
        });
        // remove the loading indicator
        $( "#loading" ).remove();
    }
}

function renderTextUser(message){

    $('.chat-container').append(`
        <div class="chat-message col-md-5 human-message">
            ${message}
        </div>
    `)

    // loading 
    $('.chat-container').append(`
        <div class="chat-message text-center col-md-2 offset-md-10 bot-message" id="loading">
            <b>...</b>
        </div>
    `)

    // clear the text input 
    $('#input_message').val('')

    // send the message
    submit_message(message)
}

var session_id = "";

$('#target').on('submit', function(e){
    e.preventDefault();
    const input_message = $('#input_message').val()
    // return if the user does not enter any text
    if (!input_message) {
      return
    }

    renderTextUser(input_message);

});

$(document).ready(function(){
    // Click on the option
    $('#chat-container').on('click','a',function(event){
        renderTextUser(this.innerText);
    });
});
