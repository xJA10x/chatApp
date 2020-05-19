// Builds function.
const generateMessage = (username, text) => {

  return {

    username,
    text,
    createdAt: new Date().getTime()

  }

}

// Builds function.
const generateLocationMessage = (username, url) => {

  return {
    username,
    url,
    createdAt: new Date().getTime()

  }

}

// Exports function.
module.exports = {

  generateMessage,
  generateLocationMessage


}
