import { createHash } from 'crypto'
import { defaultEventActions, regex } from './const'
import { Book, ComponentOptions } from './d'
import { changeToCssStyle, getContent, getMetaAndTag } from './utils'

export class Component {
    content: string
    tag: string
    isignore: boolean
    componentString: string = ''
    component_: Component[] = []
    children: Component[] = []
    token: string
    options: ComponentOptions
    meta: string
    attributes: Book<string>
    constructor(content: string, meta?: string, attributes?: Book<string>, options?: ComponentOptions) {
        this.content = content
        this.meta = meta
        this.attributes = attributes
        this.token = createHash('md5').update(Date.now().toString()).digest('hex')
        this.isignore = options?.ignore || false
        this.component_.push(this)
        this.options = options
        this.create()
    }

    create() {
        const { tag, meta } = getMetaAndTag(this.meta || '', this.attributes || {})
        this.tag = tag
        this.componentString = `<${tag} ${meta.join(' ')}>${this.component || this.content}</${tag}>`
        return this
    }
    wrap(meta?: string, attributes?: Book<string>) {
        const { tag, meta: meta_ } = getMetaAndTag(meta || '', attributes || {})
        this.componentString = `<${tag} ${meta_.join(' ')}>${this.component || this.content}</${tag}>`
        this.component_ = [this]
        return this
    }
    for(...iterator: string[] | string[][]) {
        let new_ = ''
        const replacer = (match, p1, item) => {
            if (Array.isArray(item)) return item[p1] || ''
            return item || ''
        }
        iterator.forEach((item) => {
            new_ += this.componentString.replaceAll(regex.loop_item, (match, p1) => replacer(match, p1, item))
        })
        this.componentString = new_
    }
    pre(component: Component) {
        this.component_.splice(0, 0, component)
        return this
    }
    post(component: Component) {
        this.component_.push(component)
        return this
    }
    ignore(ignore: boolean = true) {
        this.isignore = ignore
    }
    public get component() {
        return this.component_
            .map((item) => {
                const content = item.componentString
                if (!['style', 'scripts'].includes(this.tag) && !this.options?.nonparse) return getContent(content)
                return content
            })
            .join('\n')
    }
}

export class Bee {
    readonly name: string = ''
    readonly prefixFoo: string = 'bee_method_'
    readonly styles: { [index: string]: string[] } = {}
    readonly scripts: string[] = []
    readonly functions: { [index: string]: Function } = {}
    private components: Component[] = []
    constructor(name: string) {
        this.name = name
    }
    add = (content: string, meta?: string, attributes?: Book<string>, options?: ComponentOptions) => {
        const component = new Component(content, meta, attributes, options)
        if (!options?.ignore) this.push(component)
        return component
    }
    push = (component: Component) => {
        this.components.push(component)
    }
    pushMany = (component: Component[]) => {
        this.components.push(...component)
    }
    style = (query: string, style: Object) => {
        Object.entries(style).forEach(([key, value]) => {
            if (!this.styles[query]) this.styles[query] = []
            this.styles[query].push(`${changeToCssStyle(key)}: ${value}`)
        })
    }
    script = (name: string, foo: Function) => {
        this.functions[this.prefixFoo + name] = foo
    }
    event = (query: string, event: string, function_: string) => {
        const elements = `document.querySelectorAll('${query}')`
        const eventFunction = `(el) => {bee_global_functions_${this.name}['${this.prefixFoo}${function_}'](item, el)}`
        this.scripts.push(`<script>${elements}.forEach(item => {item.addEventListener('${event}', ${eventFunction})})</script>`)
    }
    pushBee = (bee: Bee) => {
        this.pushStruct(bee)
        this.pushStyle(bee)
        this.pushScripts(bee)
    }
    pushStruct = (bee: Bee) => {
        this.components = [...this.components, ...bee.components]
    }
    pushStyle = (bee: Bee) => {
        Object.entries(bee.styles).forEach(([key, value]) => {
            const currStyles = this.styles[key] ? this.styles[key] : []
            this.styles[key] = [...currStyles, ...value]
        })
    }
    pushScripts = (bee: Bee) => {
        Object.entries(bee.functions).forEach(([key, value]) => {
            this.functions[key] = value
        })
    }
    private defaultScriptsFunctions = () => {
        const defaultScript: string[] = []
        defaultScript.push(
            `<script>const bee_global_functions_${this.name} = {${Object.entries(this.functions)
                .map(([key, value]) => {
                    return `${key}: ${value.toString()}`
                })
                .join(',')}}</script>`
        )

        return defaultScript
    }
    private defaultStyleCss = () => {
        const defaultStyle: string[] = []
        defaultStyle.push(
            `<style>${Object.entries(this.styles)
                .map(([key, value]) => {
                    return `${key}{${value.join(';')}}`
                })
                .join(' ')}</style>`
        )

        return defaultStyle
    }
    private defaultScriptsEvent = () => {
        const defaultScript: string[] = []

        Object.entries(defaultEventActions).forEach(([key, value]) => {
            const elements = `document.querySelectorAll('[${key}]')`
            const event_foo = `(el) => {bee_global_functions_${this.name}['${this.prefixFoo}'+ attr](item, el)}`
            defaultScript.push(
                `<script>${elements}.forEach(item => {const attr = item.getAttribute('${key}');item.addEventListener('${value}', ${event_foo})})</script>`
            )
        })

        return defaultScript
    }
    private getComponents = () => {
        return this.components.map((item) => {
            if (!item.isignore) return item.component
        })
    }
    print = (type: string = 'all') => {
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
        }
        return build[type]
            .map((item) => {
                return item.join('\n')
            })
            .join('\n') // \n TODO for tmp instead ' '
    }
    html = () => {
        return this.components
            .map((item) => {
                if (!item.isignore) return item.component
            })
            .join('\n')
    }
}
