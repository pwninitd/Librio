getData()

async function getData() {

    const url = "/api/get-recommendations/";
    const queryString = window.location.search;
    try {
        console.log(JSON.stringify(localStorage.getItem('pref')))
        const response = await fetch(url, {
            method: "POST",
            headers: {'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value},
            body: localStorage.getItem('pref')

        }).then(response => {
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            return response.text()
        }).then(html => {
            const container = document.createElement('section');
            container.classList.add('container-lg', 'py-5');
            container.innerHTML = html;
            const navbar = document.querySelector('.navbar');
            navbar.style.display = 'flex';
            document.querySelector('#loading-spinner').remove();
            navbar.parentNode.appendChild(container);
        })


        console.log(response);
    } catch (error) {
        console.error(error.message);
    }
}
