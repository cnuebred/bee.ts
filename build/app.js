"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const cnuebred_bee_1 = require("cnuebred_bee");
const app = () => {
    const bee = new cnuebred_bee_1.Bee('readme');
    bee.pushBee(cnuebred_bee_1.scheme.base_style());
    bee.add('Hello Cube', 'h3#header.nick');
    bee.add('Here is b(some) description', 'p');
    const hr = bee.add('', 'hr');
    bee.add('How to use:', 'h3#how_to_use');
    bee.add("@0 style '@1\\(value)' => @1(value)", 'code').wrap('pre').for(['Bold', 'b'], ['Italic', 'i'], ['Underline', 'u']);
    bee.push(hr);
    bee.add('Some scripts:', 'h3#some_scripts');
    bee.add('Click me', 'button#regular_button.pretty', { on_click: 'add' });
    bee.add('0', 'span.pretty');
    bee.script('add', (item) => {
        let el = document.querySelector('span.pretty');
        const span = parseInt(el.innerHTML);
        if (span + 1 >= 15 && !item.innerHTML.includes('🎉'))
            item.innerHTML += ' 🎉';
        el.innerHTML = (span + 1).toString();
    });
    const code = bee.add(`bee.addScript('add', (item) => {
    let el = document.querySelector('span.pretty')
    const span = parseInt(el.innerHTML)
    if (span + 1 >= 15 && !item.innerHTML.includes('🎉')) item.innerHTML += ' 🎉'
        el.innerHTML = (span + 1).toString()
})`, 'code', {}, { nonparse: true, ignore: true });
    bee.add("bee.add('Click me', 'button#regular_button.pretty', { on_click: 'add' })\n" + "bee.add('0', 'span.pretty')\n", 'code', {}, { nonparse: true })
        .post(code)
        .wrap('pre');
    // console.log(bee.html())
    (0, fs_1.writeFile)('./index.html', bee.print(), (err) => { });
};
app();
