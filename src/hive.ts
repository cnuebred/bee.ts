import { randomBytes } from "crypto"
import { CssPropertiesBook } from "./d"
import { bee_package } from "./model"

type Book<T> = { [index: string]: T }
type BeeAttributes = { ref: string } | Book<string>
type BeeLocation = 'before' | 'after' | 'start' | 'end'
type BeeEvents = 'click' | 'mousemove' | 'mouseover' | 'onload'
type BeeMeta = {
    tag: string | null
    id: string | null
    ref: string | null
    class: string[] | null
}
type BeeFetchOptions = {
    method?: string
    headers?: { [index: string]: string }
    data?: { [index: string]: any },
    on?: {
        query: string
        event: string
    }
    phrase?: string,
    res?: (response) => { [index: string]: any } | void
}
type BeeEventCallback = {
    item: HTMLElement,
    event: Event,
    worker: { [index: string]: Function },
    ref: { [index: string]: HTMLElement }
}

const regex = {
    meta: /(^(?<tag>\w+))?(\#(?<id>\w+))?(\.(?<class>(\w+)*))?(\$(?<ref>(\w+)*))?/gm,
    for: /(?<!\\)\@(\d*)/gm,
    style_css: /([a-z])([A-Z])/gm,
    bee_html: {
        general: /<(?<tag>\w+)?\s+(?<attr>\w+=\"[\S\s]+\")?\s+(?<token>\w+)?>(?<content>[\S\s]+?)<\/\1 \3>/gm,
        attr: /(?<key>\w+)="(?<value>[\S\s]+?)"/gm,
    },
    shorts: {
        style: /(?<!\\)(?<type>i|b|u|s|sub|sup|mark|code)\((?<content>[\S\s]+?)(?<!\\)\)/gm,
        header: /(?<!\\)(?<type>#{1,3})(?<content>[\s\S]+?)(?<!\\)\1/gm,
        hr: /(?<!\/)^-{3}$/gm,
    }
}
const regex_shorts = {
    node(key, content) {
        for (let match of content.matchAll(regex.shorts[key])) {
            content = this[key](match, content)
        }
        return content
    },
    style: (match, content) => {
        const key = (p, _1, _2) => { return `<${_1}>${_2}</${_1}>` }
        content = content.replaceAll(regex.shorts.style, key)
        return content
    },
    header: (match, content) => {
        const type_number = match.groups.type.length
        return content.replaceAll(regex.shorts.header, `<h${type_number}>$2</h${type_number}>`)
    },
    hr: (match, content) => {
        return content.replaceAll(regex.shorts.hr, `<hr>`)
    },
}


const extract_meta = (meta: string) => {
    const regex_meta = meta.matchAll(regex.meta).next().value
    if (!regex_meta) return
    const meta_pcg = {
        tag: regex_meta.groups.tag || 'div',
        id: regex_meta.groups.id || null,
        class: regex_meta.groups.class?.split('.').filter(item => !!item) || null,
        ref: regex_meta.groups.ref || null,
    }
    return meta_pcg
}
const change_to_css_style = (key) => {
    return key.replaceAll(regex.style_css, '$1-$2').toLowerCase()
}

const recursive_get_content = (key, content) => {
    if (!content.match(regex.shorts[key])) return content
    content = regex_shorts.node(key, content)
    if (content.match(regex.shorts[key])) content = recursive_get_content(key, content)
    return content
}

export const get_content_regex_short = (content) => {
    Object.keys(regex.shorts).forEach((key) => {
        content = recursive_get_content(key, content)
    })
    return content
}
export const get_content = (content: string) => {
    content = get_content_regex_short(content)
    content = content.replaceAll(/\n/gm, '<br>')
    content = content.replaceAll(/(?<!\\)\\/gm, '')
    return content
}


export class Bee {
    readonly token: string
    content: string
    location?: BeeLocation
    children: Bee[] = []
    attributes: Book<string>
    meta: BeeMeta
    bee_style: Bee[] = []
    bee_script: Bee[] = []
    constructor(content: string = '', meta: string | BeeMeta = '', attributes: BeeAttributes = {}) {
        this.token = randomBytes(4).toString('hex')
        this.meta = typeof meta == 'string' ? extract_meta(meta) : meta
        //if (!['script', 'style'].includes(this.meta.tag))
        //  this.content = get_content(content)
        //else
        this.content = content
        this.attributes = attributes
    }
    query(token: boolean = true) {
        return `${this.meta.tag}${this.meta?.id ? '#' + this.meta.id : ''}${this.meta?.class ? '.' + this.meta.class.join('.') : ''}${token ? `[v-${this.token}] ` : ''}`
    }
    set_attributes() {
        let attributes: string[] = []
        attributes.push(this.meta?.id ? `id="${this.meta.id}"` : '')
        attributes.push(this.meta?.ref ? `ref="${this.meta.ref}"` : '')
        attributes.push(this.meta?.class && this.meta?.class.length != 0 ? `class="${this.meta.class.join(' ')}"` : '')
        Object.entries(this.attributes).forEach(([key, value]) => {
            attributes.push(`${key}="${value}"`)
        })
        return attributes
    }
    to_bee_html(struct: boolean = true) {
        const location: { [index: string]: Bee[] } = {
            before: [],
            after: [],
            start: [],
            end: [],
        }
        for (const item of this.children) {
            location[item.location].push(item)
        }
        const location_bee = (location_type: BeeLocation) => {
            return location[location_type].map(item => { return item.to_bee_html() }).join(' ')
        }
        const base = `${location_bee('before')}<${this.meta.tag} v-${this.token} ${this.set_attributes().join(' ')} >${location_bee('start')}`
            + `${!['script', 'style'].includes(this.meta.tag) ? get_content(this.content) : this.content}${location_bee('end')}`
            + `</${this.meta.tag} v-${this.token}>${location_bee('after')}`
        return base
    }
    iterate(callback: (item: Bee) => void, iterator: Bee = this) {
        callback(iterator)
        iterator.children.forEach(item => {
            if (item.children.length != 0)
                this.iterate(callback, item)
            else callback(item)
        })
    }
    for(iterator: string[] | string[][], location: BeeLocation = 'after') {
        const replacer = (match, p1, item) => {
            if (Array.isArray(item)) return item[p1] || ''
            return item || ''
        }

        const construct_bee = this.copy()

        iterator.forEach((item, index) => {
            let new_bee: Bee
            if (index == 0)
                new_bee = this
            else
                new_bee = construct_bee.copy()

            this.iterate((component) => {
                component.content = component.content.replaceAll(regex.for, (match, p1) => replacer(match, p1, item))
                component.meta = JSON.parse(JSON.stringify(component.meta).replaceAll(regex.for, (match, p1) => replacer(match, p1, item)))
                component.attributes = JSON.parse(JSON.stringify(component.attributes).replaceAll(regex.for, (match, p1) => replacer(match, p1, item)))
            }, new_bee)

            if (index != 0)
                this.push(new_bee, location)
        })
        return this
    }
    fetch(url: string, options: BeeFetchOptions, worker_bee_hive?) {
        const foo = async (url, token, options, res) => {
            const element = document.querySelector(token)
            await fetch(url, {
                method: options?.method || 'get',
                headers: options?.headers || {},
                body: options?.data ? JSON.stringify(options?.data) : null
            })
                .then(response => response.json())
                .then(result => {
                    const pcg = res(result)
                    if (pcg)
                        element.outerHTML = element.outerHTML.replaceAll(/(?<!\/)@(\w+)/gm, (p, _1) => { return pcg[_1] || '' })
                })
        }
        let script = `(${foo.toString()})
        ('${url}', '[v-${this.token}]', ${JSON.stringify(options)}, ${options.res.toString()})`
        if (options?.on) {
            script = `document.querySelector('${options.on.query}').addEventListener('${options.on.event}', () => {${script}})`
        }
        const bee_script = new Bee(script, 'script')
        this.bee_script.push(bee_script)
        return this
    }
    wrap(meta?, location: BeeLocation = 'end') {
        const copy = this.copy()
        copy.location = location
        this.meta = typeof meta == 'string' ? extract_meta(meta) : meta
        this.children = [copy]
        this.content = ''
        return this
    }
    add(content?, meta?, attributes?, location: BeeLocation = 'end') {
        const bee = new Bee(content, meta, attributes)
        this.push(bee, location)
        return bee
    }
    push(bee: Bee | Bee[], location: BeeLocation = 'after') {
        bee = Array.isArray(bee) ? bee : [bee]
        bee.forEach(item => item.location = location)
        this.children.push(...Array.isArray(bee) ? bee : [bee])
        return this
    }
    event(
        event: BeeEvents,
        // callback: (item: HTMLElement, event: Event, worker: { [index: string]: Function }, ref: { [index: string]: HTMLElement }) => void
        callback: ({ item, event, worker, ref }: BeeEventCallback) => void
        , worker_bee_hive?
    ) {
        const foo = (event, token, callback) => {
            const item = document.querySelector(token)
            const worker = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker')]
            const ref = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            item.addEventListener(event, (event) => {
                callback({ item, event, worker, ref })
            })
        }

        const script = new Bee(`(${foo.toString()})('${event}', '[v-${this.token}]', ${callback.toString()})`, 'script')
        this.bee_script.push(script)
        return this
    }
    style(query: string, style: CssPropertiesBook, single: boolean = true) {
        let style_pcg = ''
        Object.entries(style).forEach(([key, value]) => {
            style_pcg += `${change_to_css_style(key)}: ${value};`
        })
        const bee_style = new Bee(this.query(single) + ' ' + query + `{${style_pcg}}`, 'style')
        this.bee_style.push(bee_style)
        return this
    }
    copy() {
        const bee = new Bee(this.content, this.meta, this.attributes)
        bee.location = this.location
        if (this.children.length != 0)
            bee.children = this.children.map(item => { return item.copy() })
        return bee
    }
}
export class Hive {
    name: string
    bees: Bee[] = []
    private bee_styles: Bee[] = []
    private bee_scripts: Bee[] = []
    private bee_style: Bee = new Bee('', 'style')
    private bee_script: Bee = new Bee(``, 'script')
    private bee_event: Bee = new Bee(``, 'script')
    private bee_script_aggregator: string[] = []
    constructor(name: string) {
        this.name = name

        this.bee_styles.push(this.bee_style)
        this.bee_scripts.push(this.bee_script)
        this.bee_scripts.push(this.bee_event)
    }
    add(content?, meta?, attributes?) {
        const bee = new Bee(content, meta, attributes)
        this.push(bee)
        return bee
    }
    add_package(name: string) {
        const pcg = bee_package[name]()
        this.bees.push(...pcg.bees)
        this.bee_scripts.push(...pcg.bee_scripts)
        this.bee_styles.push(...pcg.bee_styles)
        this.bee_script_aggregator.push(...pcg.bee_script_aggregator)
    }
    push(bee: Bee | Bee[]) {
        bee = Array.isArray(bee) ? bee : [bee]
        bee.forEach(bee => {
            if (bee.meta.tag == 'script')
                this.bee_scripts.push(bee)
            else if (bee.meta.tag == 'style')
                this.bee_style.push(bee)
            else this.bees.push(bee)
        })
        return this
    }
    style(query: string, style: CssPropertiesBook) {
        let style_pcg = ''
        Object.entries(style).forEach(([key, value]) => {
            style_pcg += `${change_to_css_style(key)}: ${value};`
        })
        this.bee_style.content += query + `{${style_pcg}}`
        return this
    }
    script = (script: { [index: string]: Function }) => {
        Object.entries(script).forEach(([key, value]) => {
            const foo_string = value.toString()
            if (foo_string.startsWith('('))
                this.bee_script_aggregator.push(`${key}:${value.toString()}`)
            else
                this.bee_script_aggregator.push(`${value.toString()}`)
        })
        return this
    }
    private ref(worker_bee_hive?) {
        const foo = () => {
            const refs = document.querySelectorAll('[ref]')
            const worker_ = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            refs.forEach(item => {
                worker_[item.getAttribute('ref')] = item
            })
        }
        this.bee_event.content = `window.onload = () => {(${foo.toString()})()}`
    }
    private separate_scripts(group: Bee[] = this.bees) {
        group.forEach((bee, index) => {
            if (bee.children.length != 0) this.separate_scripts(bee.children)
            if (bee.bee_script.length != 0)
                this.bee_scripts.push(...bee.bee_script)
            if (bee.bee_style.length != 0)
                this.bee_styles.push(...bee.bee_style)
        })
    }
    to_html() {
        this.bee_script.content = `const worker_bee_hive = {hive_${this.name}: {${this.bee_script_aggregator.join(',')}}, hive_${this.name}_ref: {}}`
        this.bee_script.attributes['worker'] = `hive_${this.name}`

        this.separate_scripts()
        this.ref()

        return [this.bee_styles, this.bees, this.bee_scripts].map(item => item.map(bee => {
            return bee.to_bee_html()
        }).join('')).join('')

    }
}