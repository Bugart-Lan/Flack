const template = Handlebars.compile(document.querySelector('#card-template').innerHTML);
const channel_template = Handlebars.compile(document.querySelector('#channel-template').innerHTML);

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

    if (!localStorage.getItem('current_channel')) {
        const first = document.querySelector('.nav-link')
        localStorage.setItem('current_channel', first.dataset.channel)
    }

    if (!localStorage.getItem('channel_list')) {
        const request = new XMLHttpRequest()
        request.open('GET', 'get_channels')
        request.onload = () => {
            const response = request.response
            console.log(response)
            localStorage.setItem('channel_list', response)
        }
        request.send()
    }

    load_page(localStorage.getItem('current_channel'))

    //add new channel
    const btn = document.querySelector('#add_channel')
    btn.onclick = () => {
        var valid = false
        var message = ""
        const channel_list = JSON.parse(localStorage.getItem('channel_list'))
        while (!valid) {
            var name = prompt(`${message}Please enter the channel name here: `)
            if (name == null) { break }
            else if (name.length == 0) { message = "You must enter a name!\n" }
            else if (channel_list.indexOf(name) != -1) { message = "The name has already been used! Please choose another one.\n" }
            else {
                channel_list.push(name)
                console.log(channel_list)
                localStorage.setItem('channel_list', JSON.stringify(channel_list))
                const request = new XMLHttpRequest()
                request.open('GET', `/add_new_channel/${name}`)
                request.send()
                addNewList(name)
                load_page(name)
                valid = true
            }
        }
    }


    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    socket.on('connect', () => {
        document.querySelector('#submit').onclick = () => {
            const message = document.querySelector('#message').value
            const channel = localStorage.getItem('current_channel')
            const time = timestamp()
            console.log(time)
            socket.emit('new message', {'message': message, 'name': name, 'timestamp': time, 'channel': channel})
            document.querySelector('#message').value = ""
        }
    })

    socket.on('broadcast_new_message', data => {
        const current_channel = localStorage.getItem('current_channel')
        console.log(current_channel)
        console.log(data.channel)
        if (current_channel == data.channel) { insertNewCard(data.name, data.message, data.timestamp) }
    })

    const name = localStorage.getItem('display_name')
    const current_channel = localStorage.getItem('current_channel')
    // document.querySelector('#name').innerHTML = `Hi ${name}`
    document.querySelector('#current_channel').innerHTML = `#${current_channel}`
})

function load_page(name) {
    document.querySelector('#current_channel').innerHTML = `#${name}`
    const request = new XMLHttpRequest()
    request.open('GET', `/load_channel/${name}`)
    request.onload = () => {
        document.querySelectorAll('.card').forEach(element => {
            element.parentNode.removeChild(element)
        })
        console.log(request.response)
        const response = JSON.parse(request.response)
        for (let i = 0; i < response.length; i++) {
            insertNewCard(response[i]['name'], response[i]['message'], response[i]['timestamp'])
        }
    }
    request.send()
}

const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function timestamp() {
    const today = new Date
    var time = months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear() + ', '
    var h = today.getHours()
    var m = today.getMinutes()
    if (h / 10 >> 0 == 0) {h = `0${h}`}
    if (m / 10 >> 0 == 0) {m = `0${m}`}
    time = time + h + ':' + m
    console.log(time)
    return time
}

function switchChannel(channel) {
    console.log(channel)
    localStorage.setItem('current_channel', channel)
    load_page(channel)
    return false
}

function addNewList(name) {
    const content = channel_template({'channel': name})
    const channel_list = document.querySelector('#channels')
    channel_list.innerHTML += content
}

function insertNewCard(name, text, timestamp) {
    const content = template({'name': name, 'message': text, 'timestamp': timestamp})
    const page = document.querySelector('#page')
    page.innerHTML += content
}
