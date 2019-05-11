document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('display_name')) {
        var input = prompt("Please enter your display name: ")
        while (input.length == 0) {
            input = prompt("You must enter your display name: ")
        }
        if (input != "null") {
            localStorage.setItem('display_name', input)
        }
    }

    load_page(first)
    /*
    if (!localStorage.getItem('dialogs')) {
        var dialogs = {'Channel_1': []}
        localStorage.setItem('dialogw', JSON.stringify(dialogs))
    }
    var dialogs = JSON.parse(localStorage.getItem('dialogs'))
    var current_channel = Object.keys(dialog)[0]
    */

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            load_page(link.dataset.channel)
            return false
        }
    })


    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {
        document.querySelector('#submit').onclick = () => {
            const message = document.querySelector('#message').value
            socket.emit('new message', {'message': message, 'name': name})
            document.querySelector('#message').value = ""
        }
    })

    socket.on('broadcast_new_message', data => {
        //dialog[current_channel].push(data)
        //if (dialog.length > 100) { dialog[current_channel].shift() }
        addNewBox(data.name, data.message)
    })

    const name = localStorage.getItem('display_name')
    document.querySelector('#name').innerHTML = `Hi ${name}`
    document.querySelector('#current_channel').innerHTML = `#${first}`
})

function load_page(name) {
    document.querySelector('#current_channel').innerHTML = `#${name}`
    const request = new XMLHttpRequest()
    request.open('GET', `/change_channel/${name}`)
    request.onload = () => {
        document.querySelectorAll('.card').forEach(element => {
            element.parentNode.removeChild(element)
        })
        console.log(request.response)
        const response = JSON.parse(request.response)
        for (let i = 0; i < response.length; i++) {
            addNewBox(response[i]['name'], response[i]['message'])
        }
    }
    request.send()
}

function addNewBox(name, text) {
    var card = document.createElement('div')
    card.className = "card bg-light mb-3"

    var newDiv = document.createElement('div')
    newDiv.className = "row no-gutters"

    var newDiv1 = document.createElement('div')
    newDiv1.className = "col-1"
    newDiv1.setAttribute('style', 'padding: 10px;')
    var img = document.createElement('img')
    img.className = "card-img"
    img.setAttribute('src', '/static/tiger.png')
    newDiv1.append(img)
    newDiv.append(newDiv1)

    var newDiv2 = document.createElement('div')
    newDiv2.className = "col-md-8"
    var card_body = document.createElement('div')
    card_body.className = "card-body"
    var h4 = document.createElement('h4')
    h4.className = "card-title"
    h4.innerHTML = name
    card_body.append(h4)
    var p = document.createElement('p')
    p.className = "card-text"
    p.innerHTML = text
    card_body.append(p)
    newDiv2.append(card_body)

    newDiv.append(newDiv2)
    card.append(newDiv)

    var page = document.querySelector('#page')
    var button = document.querySelector('#submit-form')
    page.insertBefore(card, button)
}
