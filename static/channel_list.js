document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('display_name'))
        localStorage.setItem('display_name', prompt("Please enter your display name: "))
})
