"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bee = exports.Component = void 0;
const crypto_1 = require("crypto");
const const_1 = require("./const");
const utils_1 = require("./utils");
class Component {
    constructor(content, meta, attributes, options) {
        this.componentString = '';
        this.component_ = [];
        this.children = [];
        this.content = content;
        this.meta = meta;
        this.attributes = attributes;
        this.token = (0, crypto_1.createHash)('md5').update(Date.now().toString()).digest('hex');
        this.isignore = options?.ignore || false;
        this.component_.push(this);
        this.options = options;
        this.create();
    }
    create() {
        const { tag, meta } = (0, utils_1.getMetaAndTag)(this.meta || '', this.attributes || {});
        this.tag = tag;
        this.componentString = `<${tag} ${meta.join(' ')}>${this.component || this.content}</${tag}>`;
        return this;
    }
    wrap(meta, attributes) {
        const { tag, meta: meta_ } = (0, utils_1.getMetaAndTag)(meta || '', attributes || {});
        this.componentString = `<${tag} ${meta_.join(' ')}>${this.component || this.content}</${tag}>`;
        this.component_ = [this];
        return this;
    }
    for(...iterator) {
        let new_ = '';
        const replacer = (match, p1, item) => {
            if (Array.isArray(item))
                return item[p1] || '';
            return item || '';
        };
        iterator.forEach((item) => {
            new_ += this.componentString.replaceAll(const_1.regex.loop_item, (match, p1) => replacer(match, p1, item));
        });
        this.componentString = new_;
    }
    pre(component) {
        this.component_.splice(0, 0, component);
        return this;
    }
    post(component) {
        this.component_.push(component);
        return this;
    }
    ignore(ignore = true) {
        this.isignore = ignore;
    }
    get component() {
        return this.component_
            .map((item) => {
            const content = item.componentString;
            if (!['style', 'scripts'].includes(this.tag) && !this.options?.nonparse)
                return (0, utils_1.getContent)(content);
            return content;
        })
            .join('\n');
    }
}
exports.Component = Component;
class Bee {
    constructor(name) {
        this.name = '';
        this.prefixFoo = 'bee_method_';
        this.styles = {};
        this.scripts = [];
        this.functions = {};
        this.components = [];
        this.add = (content, meta, attributes, options) => {
            const component = new Component(content, meta, attributes, options);
            if (!options?.ignore)
                this.push(component);
            return component;
        };
        this.push = (component) => {
            this.components.push(component);
        };
        this.pushMany = (component) => {
            this.components.push(...component);
        };
        this.style = (query, style) => {
            Object.entries(style).forEach(([key, value]) => {
                if (!this.styles[query])
                    this.styles[query] = [];
                this.styles[query].push(`${(0, utils_1.changeToCssStyle)(key)}: ${value}`);
            });
        };
        this.script = (name, foo) => {
            this.functions[this.prefixFoo + name] = foo;
        };
        this.event = (query, event, function_) => {
            const elements = `document.querySelectorAll('${query}')`;
            const eventFunction = `(el) => {bee_global_functions_${this.name}['${this.prefixFoo}${function_}'](item, el)}`;
            this.scripts.push(`<script>${elements}.forEach(item => {item.addEventListener('${event}', ${eventFunction})})</script>`);
        };
        this.pushBee = (bee) => {
            this.pushStruct(bee);
            this.pushStyle(bee);
            this.pushScripts(bee);
        };
        this.pushStruct = (bee) => {
            this.components = [...this.components, ...bee.components];
        };
        this.pushStyle = (bee) => {
            Object.entries(bee.styles).forEach(([key, value]) => {
                const currStyles = this.styles[key] ? this.styles[key] : [];
                this.styles[key] = [...currStyles, ...value];
            });
        };
        this.pushScripts = (bee) => {
            Object.entries(bee.functions).forEach(([key, value]) => {
                this.functions[key] = value;
            });
        };
        this.defaultScriptsFunctions = () => {
            const defaultScript = [];
            defaultScript.push(`<script build_in="foo">const bee_global_functions_${this.name} = {${Object.entries(this.functions)
                .map(([key, value]) => {
                return `${key}: ${value.toString()}`;
            })
                .join(',')}}</script>`);
            return defaultScript;
        };
        this.defaultStyleCss = () => {
            const defaultStyle = [];
            defaultStyle.push(`<style>${Object.entries(this.styles)
                .map(([key, value]) => {
                return `${key}{${value.join(';')}}`;
            })
                .join(' ')}</style>`);
            return defaultStyle;
        };
        this.defaultScriptsEvent = () => {
            const defaultScript = [];
            Object.entries(const_1.defaultEventActions).forEach(([key, value]) => {
                const elements = `document.querySelectorAll('[${key}]')`;
                const event_foo = `(el) => {bee_global_functions_${this.name}['${this.prefixFoo}'+ attr](item, el)}`;
                defaultScript.push(`<script build_in="event">${elements}.forEach(item => {const attr = item.getAttribute('${key}');item.addEventListener('${value}', ${event_foo})})</script>; `);
            });
            return defaultScript;
        };
        this.getComponents = () => {
            return this.components.map((item) => {
                if (!item.isignore)
                    return item.component;
            });
        };
        this.print = (type = 'all') => {
            /*
            type:
            'all' - all components
            'struct' - only html structure
            'scripts' - only scripts
            'styles' - only styles
            'scriptsFull' - scripts with events
            */
            const build = {
                all: [
                    this.getComponents(),
                    this.defaultScriptsFunctions(),
                    this.defaultScriptsEvent(),
                    this.scripts,
                    this.defaultStyleCss(),
                ],
                struct: [this.getComponents()],
                scripts: [this.defaultScriptsFunctions(), this.scripts],
                styles: [this.defaultStyleCss()],
                scriptsFull: [this.defaultScriptsFunctions(), this.defaultScriptsEvent(), this.scripts],
            };
            return build[type]
                .map((item) => {
                return item.join('\n');
            })
                .join('\n'); // \n TODO for tmp instead ' '
        };
        this.html = () => {
            return this.components
                .map((item) => {
                if (!item.isignore)
                    return item.component;
            })
                .join('\n');
        };
        this.name = name;
    }
}
exports.Bee = Bee;
