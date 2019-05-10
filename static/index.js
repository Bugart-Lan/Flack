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
    /*if (!localStorage.getItem('dialog')) {
        var dialog = {'Channel_1': []}
        console.log(dialog)
        localStorage.setItem('dialog', JSON.stringnify(dialog))
    }
    var dialog = localStorage.getItem('dialog')
    var current_channel = Object.keys(dialog)[0]

    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = () => {
            current_channel = link.dataset.channel
            load_page(link.dataset.channel)
        }
    })
    */

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
})

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
