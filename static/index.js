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
            console.log(`Message: ${message}. Button click at ${time}`)
            file = handleFileUpload((f) => {
                socket.emit('new message', {'message': message, 'name': name, 'timestamp': time,
                                            'channel': channel, 'file': f})
            })
            document.querySelector('#message').value = ""
            document.querySelector('#file-upload').value = null
            document.querySelector('#files').innerHTML = ""
        }
    })

    socket.on('broadcast_new_message', data => {
        const current_channel = localStorage.getItem('current_channel')
        if (current_channel == data.channel) {
            console.log(`Data receive at ${timestamp()}`)
            insertNewCard(data.name, data.message, data.timestamp, data.file)
        }
    })

    const name = localStorage.getItem('display_name')
    const current_channel = localStorage.getItem('current_channel')
    // document.querySelector('#name').innerHTML = `Hi ${name}`
    document.querySelector('#current_channel').innerHTML = `#${current_channel}`
})

function load_page(name) {
    console.log('load page')
    document.querySelector('#current_channel').innerHTML = `#${name}`
    const request = new XMLHttpRequest()
    request.open('GET', `/load_channel/${name}`)
    request.onload = () => {
        document.querySelector('#page').innerHTML = ''
        const response = JSON.parse(request.response)
        for (let i = 0; i < response.length; i++) {
            insertNewCard(response[i]['name'], response[i]['message'], response[i]['timestamp'], response[i]['file'])
        }
    }
    request.send()
}

const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function timestamp() {
    const today = new Date
    return today.toString()
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

function insertNewCard(name, text, timestamp, file) {
    var attach_src = ''
    var attach_name = ''
    var style = 'display:none'
    if (file != null) {
        attach_src = file.binary
        attach_name = file.name
        style = ''
    }
    const content = template({'name': name, 'message': text, 'timestamp': timestamp,
                            'style': style, 'attach_src': attach_src, 'attach_name': attach_name })
    const page = document.querySelector('#page')
    page.innerHTML += content
    feather.replace()
    $('[data-toggle="tooltip"]').tooltip()
    const time = new Date()
    console.log(`Card inserted at ${time.toString()}`)
}

function upload() {
    document.getElementById('file-upload').click()
}

function updateFiles() {
    console.log('update files!')
    const files = document.getElementById('file-upload').files[0]
    console.log(files.name)
    document.getElementById('files').innerHTML =
        `<div>
            <span data-feather='file'></span>${ files.name }
        </div>`
    feather.replace()
}

function handleFileUpload(callback) {
    file_upload = document.getElementById('file-upload')
    if (file_upload.files.length > 0) {
        const file = document.getElementById('file-upload').files[0]
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
            const arrayBuffer = fileReader.result
            const f = {
                name: file.name,
                type: file.type,
                size: file.size,
                binary: arrayBuffer
            }
            callback(f)
        }
    } else {
        callback(null)
    }
}
