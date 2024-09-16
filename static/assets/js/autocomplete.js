const DEFAULTS = {
    threshold: 2,
    maximumItems: 3,
    highlightTyped: true,
    highlightClass: 'text-primary',
    label: 'label',
    value: 'value',
    showValue: false,
    showValueBeforeLabel: false,
};

class Autocomplete {
    constructor(field, options) {
        this.field = field;
        this.options = Object.assign({}, DEFAULTS, options);
        this.dropdown = null;
        this.selected = new SelectedItems();
        this.queryData = false;
        this.csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        this.options.onSelectItem = ({label, value}) => {
            this.field.value = "";
            this.selected.createSelectedElements({label, value});
        };
        field.parentNode.classList.add('dropdown');
        field.setAttribute('data-bs-toggle', 'dropdown');
        field.classList.add('dropdown-toggle');

        const dropdown = ce(`<div class="dropdown-menu w-100 rounded-bottom-5 rounded-top-0"></div>`);
        if (this.options.dropdownClass)
            dropdown.classList.add(this.options.dropdownClass);

        insertAfter(dropdown, field);

        this.dropdown = new window.bootstrap.Dropdown(field, this.options.dropdownOptions);

        field.addEventListener('click', (e) => {
            this.queryData = false;
            if (this.createItems() === 0) {
                e.stopPropagation();
                this.dropdown.hide();
            }
        });

        let timeout = null;
        field.addEventListener('input', timed => {
            const items = this.field.nextSibling;
            items.innerHTML = '';
            items.appendChild(ce('<div class="d-flex justify-content-center" id="loader">\n' +
                '  <div class="spinner-border text-primary m-2" role="status">\n' +
                '    <span class="visually-hidden">Loading...</span>\n' +
                '  </div>\n' +
                '</div>'));

            this.dropdown.show();

            // Clear the timeout if it has already been set.
            // This will prevent the previous task from executing
            // if it has been less than <MILLISECONDS>
            clearTimeout(timeout);

            // Make a new timeout set to go off in 1000ms (1 second)

            timeout = setTimeout(run => {
                const url = "/api/search-books/";

                const request = new Request(
                    url,
                    {
                        method: 'POST',
                        headers: {'X-CSRFToken': this.csrftoken},
                        mode: 'same-origin', // Do not send CSRF token to another domain.
                        body: JSON.stringify({query: this.field.value})
                    }
                );
                try {
                    fetch(request).then(response => response.json())
                        .then(response => {
                            console.log(response);
                            this.setData(response);
                        });
                } catch (error) {
                    throw new Error(`Error: ${error}`);
                }

                if (this.options.onInput)
                    this.options.onInput(this.field.value);
                this.renderIfNeeded();
            }, 1000);
        });

        field.addEventListener('keydown', (e) => {
            if (e.keyCode === 27) {
                this.dropdown.hide();
                return;
            }
            if (e.keyCode === 40) {
                this.dropdown._menu.children[0]?.focus();
                return;
            }
        });
    }                    // const json = ;

    setData(data) {
        this.options.data = data;
        this.queryData = true;
        this.renderIfNeeded();
    }

    renderIfNeeded() {
        if (this.createItems() > 0) {
            this.dropdown.show();
        } else {
            this.field.click;
        }
        this.queryData = false;
    }

    createItem(lookup, item, found) {
        let label = '';
        if (this.options.highlightTyped) {
            const className = Array.isArray(this.options.highlightClass) ? this.options.highlightClass.join(' ')
                : (typeof this.options.highlightClass == 'string' ? this.options.highlightClass : '');


            for (let i = 0; i < item.label.length; i++) {
                if (found.indexOf(item.label[i].toLowerCase()) > -1) {
                    let lookupLength, lookupIndex;
                    for (let j = 0; j < lookup.length; j++) {
                        if (item.label[i].toLowerCase().includes(lookup[j].toLowerCase())) {
                            lookupLength = lookup[j].length;
                            lookupIndex = j;
                            break;
                        }
                    }
                    const idx = item.label[i].toLowerCase().indexOf(lookup[lookupIndex].toLowerCase());

                    label += ' ' + item.label[i].substring(0, idx)
                        + `<span class="${className}">${item.label[i].substring(idx, idx + lookupLength)}</span>`
                        + item.label[i].substring(idx + lookupLength, item.label[i].length);
                } else {
                    label += ' ' + item.label[i];
                }
            }

        } else {
            label = item.label;
        }

        if (this.options.showValue) {
            if (this.options.showValueBeforeLabel) {
                label = `${item.value} ${label}`;
            } else {
                label += ` ${item.value}`;
            }
        }

        return ce(`<button type="button" class="dropdown-item text-wrap" data-label="${item.label.join(' ')}" data-value="${item.value}">${label}</button>`);
    }

    createItems() {
        const lookup = this.field.value;
        const items = this.field.nextSibling;

        if (lookup.length < this.options.threshold) {
            this.dropdown.hide();
            return 0;
        }

        if (this.queryData === false) {
            return items.childNodes.length;
        }
        const keys = Object.keys(this.options.data);
        let lookupKeys = removeDiacritics(lookup).split(' ');
        let count = 0;

        if (!keys.length) {
            document.createElement('p').classList.add();
            items.appendChild(ce('<p class="dropdown-item text-wrap" >No results found...</p>'));
            items.removeChild(items.firstChild);
            return items.childNodes.length;
        }

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const entry = this.options.data[key];
            let found = [];
            let dataFormated = removeDiacritics(this.options.label ? entry[this.options.label] : key).split(' ');
            lookupKeys.forEach((e) => {
                found = found.concat(dataFormated.filter(str => str.toLowerCase().includes(removeDiacritics(e).toLowerCase())));
            })

            if (found.length !== 0) {
                items.appendChild(this.createItem(lookupKeys, {
                    label: dataFormated,
                    value: this.options.value ? entry[this.options.value] : entry
                }, found.map(e => e.toLowerCase())));
                if (this.options.maximumItems > 0 && ++count >= this.options.maximumItems)
                    break;
            }

            if (items.childNodes.length > 1 && this.queryData === true && document.querySelector('#loader')) {
                items.removeChild(items.firstChild);
            }
        }


        this.field.nextSibling.querySelectorAll('.dropdown-item').forEach((item) => {
            item.addEventListener('click', (e) => {
                let dataLabel = e.currentTarget.getAttribute('data-label');
                let dataValue = e.currentTarget.getAttribute('data-value');

                this.field.value = dataLabel;

                if (this.options.onSelectItem) {
                    this.options.onSelectItem({
                        value: dataValue,
                        label: dataLabel
                    });
                }

                this.dropdown.hide();
            });
        });

        return items.childNodes.length;
    }

    getSelectedBooks() {
        return this.selected.selected;
    }
}

class SelectedItems {
    constructor() {
        this.field = document.querySelector('#selectedBooks');
        this.selected = [];
    }


    createSelectedElement({label, value}) {
        let selectedBookBtn = this.createButton({label, value});
        selectedBookBtn.addEventListener('click', (e) => {
            let modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = `Do you wish to delete the ${label} book from your selecetion of recently read books?`;
            let oldDeleteBtn = document.querySelector('#delete-btn');
            let newDeleteBtn = oldDeleteBtn.cloneNode(true);
            oldDeleteBtn.parentNode.replaceChild(newDeleteBtn, oldDeleteBtn);
            newDeleteBtn.addEventListener('click', (e) => {
                console.log(value);
                this.field.removeChild(document.querySelector(`[value="${value}"]`));
                for (let i = 0; i < this.selected.length; i++) {
                    if (this.selected[i].value === value) {
                        this.selected.splice(i, 1);
                    }
                }
            }, true);
        })


        return selectedBookBtn;
    }

    createSelectedElements({label, value}) {
        if (this.alreadySelected(value)) {
            return;
        }

        this.selected.push({title: label.split(' - ')[0], author: label.split(' - ')[1], value: value});
        this.field.appendChild(this.createSelectedElement({label, value}));
    }

    createButton({label, value}) {
        let selectedBookBtn = document.createElement('button');
        let btnAttributes = {
            'class': 'btn btn-outline-secondary mx-2 my-1',
            'value': value,
            'type': 'button',
            'data-bs-toggle': 'modal',
            'data-bs-target': '#confirmationModal'
        }
        for (const [key, value] of Object.entries(btnAttributes)) {
            selectedBookBtn.setAttribute(key, value);
        }
        selectedBookBtn.innerHTML = label + '&nbsp;&nbsp;<i class="fa-regular fa-circle-xmark"></i>';
        return selectedBookBtn;
    }

    alreadySelected(value) {
        return this.selected.indexOf(value) > -1;
    }

}

/**
 * @param html
 * @returns {Node}
 */
function ce(html) {
    let div = document.createElement('div');
    div.innerHTML = html;
    return div.firstChild;
}

/**
 * @param elem
 * @param refElem
 * @returns {*}
 */
function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

/**
 * @param {String} str
 * @returns {String}
 */
function removeDiacritics(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}
