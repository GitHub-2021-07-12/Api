import {Component} from '../Component_new.js';


export class A extends Component {
    // static _html_url = `${import.meta.url}/../${this.name}.html`;
    static _html_url = new URL(`${this.name}.html`, import.meta.url);

    static _html = `
        <link component__awaited href='{{resource.css}}' rel='stylesheet'>


        <div id='root'>
            <button id='button'>A</button>
            <svg class='icon'>
                <use href='{{resource.svg}}'/>
            </svg>
        </div>
    `;

    static _resources = {
        // 'resource.css': () => `${import.meta.url}/../${this.name}.css`,
        'resource.css': new URL(`${this.name}.css`, import.meta.url),
        'resource.svg': new URL('../../Edit/Edit.svg#cross', import.meta.url),
    };


    _init() {
        this._elements.button.addEventListener('click', () => console.log(this.css__get('color')));

        console.log(this.css__get('color'))
    }
}
