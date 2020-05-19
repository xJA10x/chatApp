/****************************

client file

****************************/

// Connects to the server
// using websockets
const socket = io();

// Server (emit) -> client (receive) --acknowledgement ---> server
// client (emit) -> server (receive) --acknowledgement ---> client

// Elements.
// Gets the form by its id.
const $messageForm = document.querySelector('#message-form');
// Gets input element by its id.
const $messageFormInput = $messageForm.querySelector('input');
// Gets button element by its id..
const $messageFormButton = $messageForm.querySelector('button');
// Get button element.
const $sendLocationButton = document.querySelector('#send-location');
// Gets element by its id.
const $messages = document.querySelector('#messages');


// Templates.
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Builds function.
const autoscroll = () => {

  // New message element.
  const $newMessage = $messages.lastElementChild

  // Height of the new message.
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height.
  const visibleHeight = $messages.offsetHeight

  // Height of messages container.
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight

  // Builds if statement.
  if(containerHeight - newMessageHeight <= scrollOffset) {

    $messages.scrollTop = $messages.scrollHeight

  }

}

// Receives event from the server.
// Takes two arguments,
// the name of the event and a function
// to run when that event occours.
socket.on('message', (message) => {

  // Outputs to the console.
  console.log(message)

  // Renders message to the browser.
  const html = Mustache.render(messageTemplate, {

    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')

  })

  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()

});

// Receives event from the server.
socket.on('locationMessage', (message) => {

  // Renders on the browser.
  console.log(message)
  const html = Mustache.render(locationMessageTemplate, {

    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')

  })

  // Adds html to the document.
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()

})

// Receives event from the server.
socket.on('roomData', ({room, users}) => {

  const html = Mustache.render(sidebarTemplate, {

    room,
    users

  })

  // Selects element.
  document.querySelector('#sidebar').innerHTML = html


})

// Event listener.
$messageForm.addEventListener('submit', (e) => {

  // Prevents the form from submiting.
  e.preventDefault()

  // Disables the form.
  $messageFormButton.setAttribute('disabled', 'disabled')

  // Gets input from the user.
  // Disable form.
  const message = e.target.elements.message.value

  // Emits event from the client to the server.
  // Takes threee paramaters,
  // thrid one is an acknowledgement.
  socket.emit('sendMessage', message, (error) => {

    // Enables form.
    $messageFormButton.removeAttribute('disabled')

    // Clears the input.
    $messageFormInput.value = ''
    $messageFormInput.focus()

    // Builds if statement.
    if(error) {

      return console.log(error)

    }

    // Runs if there is no error.
    console.log('Message delivered')

  })

});

// Grabs button by its id.
// Using geolocation api when
// the button is clicked.
$sendLocationButton.addEventListener('click', () => {

  // Runs when geolocation is not supported.
  if(!navigator.geolocation) {

    return alert('Geolocation is not supported by your browser.')

  }

  // Disables the button.
  $sendLocationButton.setAttribute('disabled', 'disabled')

  // fetches location by using geolocation.
  // Takes one parameter,
  // a callback function.
  navigator.geolocation.getCurrentPosition((position) => {

    // Emits event from the client to server.
    socket.emit('sendLocation', {

      // Grabs the latitude
      latitude: position.coords.latitude,
      longitude: position.coords.longitude

    }, () => {

      // Enables the button again.
      $sendLocationButton.removeAttribute('disabled')

      console.log('Location shared!')

    })

  })

});

// Emits event that the server is going to litsen for.
socket.emit('join', { username, room }, (error) => {

  if (error) {

    alert(error)
    location.href = '/'

  }

})
