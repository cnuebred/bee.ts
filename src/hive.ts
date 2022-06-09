import { randomBytes } from "crypto"
import { BeeLocation, CssPropertiesBook, BeeAttributes, BeeEventCallback, BeeEvents, BeeFetchOptions, BeeMeta, Book } from "./d"
import { block_attributes, change_to_css_style, extract_meta, get_content, regex } from './utils'
import { bee_package } from "./model"


export class Bee {
    readonly token: string
    content: string
    location?: BeeLocation
    children: Bee[] = []
    attributes: BeeAttributes
    private replace: Book<string> = {}
    meta: BeeMeta
    bee_style: Bee[] = []
    bee_script: Bee[] = []
    constructor(content: string = '', meta: string | BeeMeta = '', attributes: BeeAttributes = {}) {
        this.token = randomBytes(4).toString('hex')
        this.meta = typeof meta == 'string' ? extract_meta(meta) : meta
        this.content = content
        this.attributes = attributes
        this.replace = this.attributes?.replace as unknown as Book<string>
    }
    query(token: boolean = true) {
        return `${this.meta.tag}${this.meta?.id ? '#' + this.meta.id : ''}${this.meta?.class ? '.' + this.meta.class.join('.') : ''}${token ? `[v-${this.token}] ` : ''}`
    }
    set_replace(obj: Book<string>) {
        this.replace = { ...this.replace, ...obj }
        return this
    }
    set_attributes() {
        let attributes: string[] = []
        attributes.push(this.meta?.id ? `id="${this.meta.id}"` : '')
        attributes.push(this.meta?.ref ? `ref="${this.meta.ref}"` : '')
        attributes.push(this.meta?.class && this.meta?.class.length != 0 ? `class="${this.meta.class.join(' ')}"` : '')
        Object.entries(this.attributes).forEach(([key, value]) => {
            if (!block_attributes.includes(key))
                attributes.push(`${key}="${value}"`)
        })
        return attributes
    }
    private to_replace(content: string, remove_useless_replace: boolean = true) {
        if (!this.replace) return remove_useless_replace ? content.replaceAll(/(?<!\\)>{\s*[\S\s]*\s*}/gm, '') : content
        Object.entries(this.replace).forEach(([key, value]) => {
            content = content.replaceAll(new RegExp(`(?<!\\\\)>{\\s*${key}\\s*}`, 'gm'), value)
        })
        return remove_useless_replace ? content.replaceAll(/(?<!\\)>{\s*[\S\s]*\s*}/gm, '') : content
    }
    to_bee_html(remove_useless_replace: boolean = true) {
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
            return location[location_type].map(item => { item.set_replace(this.replace); return item.to_bee_html(remove_useless_replace) }).join(' ')
        }
        this.content = this.to_replace(this.content, remove_useless_replace)
        const base = `${location_bee('before')}<${this.meta.tag} v-${this.token} ${this.set_attributes().join(' ')} >${location_bee('start')}`
            + `${!['script', 'style'].includes(this.meta.tag) ? get_content(this.content) : this.content}${location_bee('end')}`
            + `</${this.meta.tag} v-${this.token}>${location_bee('after')}`
        return base
    }
    iterate(callback: (item: Bee) => void, iterator: Bee = this) {
        callback(iterator)
        const iterator_main = ([...iterator.children, ...iterator.bee_script]).forEach(item => {
            if (item.children.length != 0 || item.bee_script.length != 0)
                this.iterate(callback, item)
            else callback(item)
        })
    }
    for(iterator: string[] | string[][], location: BeeLocation = 'after') {// TODO add for options
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
    fetch(url: string, options: BeeFetchOptions, query: string = '', worker_bee_hive?) {
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
                    if (pcg) {
                        element.innerHTML = element.innerHTML.replaceAll(/(?<!\/)@(\w+)/gm, (p, _1) => { return pcg[_1] || '' })
                        Object.values(element.attributes).forEach((item: Attr) => {
                            item.value = item.value.replaceAll(/(?<!\/)@(\w+)/gm, (p, _1) => { return pcg[_1] || '' })
                        })
                    }
                })
        }
        let script = `(${foo.toString()})
        ('${url}', '>{query_bee_script}', ${JSON.stringify(options)}, ${options.res.toString()})`
        if (options?.on) {
            script = `document.querySelector('${options.on.query}').addEventListener('${options.on.event}', () => {${script}})`
        }
        const bee_script = new Bee(script, 'script')
        bee_script.set_replace({ query_bee_script: `[v-${this.token}]${query ? ' ' + query : query}` })
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
    add(content?: string, meta?: string | BeeMeta, attributes?: BeeAttributes, location: BeeLocation = 'end') {
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
        callback: ({ item, event, worker, ref }: BeeEventCallback) => void,
        query: string = ''
        , worker_bee_hive?
    ) {
        const foo = (event, token, callback) => {
            const items = document.querySelectorAll(token)
            const worker = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker')]
            const ref = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            items.forEach(item => {
                item.addEventListener(event, (event) => {
                    callback({ item, event, worker, ref })
                })
            })
        }

        const script = new Bee(`(${foo.toString()})('${event}', '>{query_bee_script}' , ${callback.toString()})`, 'script')
        script.set_replace({ query_bee_script: `[v-${this.token}]${query ? ' ' + query : query}` })
        this.bee_script.push(script)
        return this
    }
    style(query: string, style: CssPropertiesBook, single: boolean = true) {
        let style_pcg = ''
        Object.entries(style).forEach(([key, value]) => {
            style_pcg += `${change_to_css_style(key)}: ${value};`
        })
        const bee_style = new Bee('>{query_bee_style} ' + query + `{${style_pcg}}`, 'style')
        bee_style.set_replace({ query_bee_style: this.query(single) })
        this.bee_style.push(bee_style)
        return this
    }
    click(callback: ({ item, event, worker, ref }: BeeEventCallback) => void, query: string = '') {
        this.event("click", callback, query)
        return this
    }
    copy() {
        const bee = new Bee(this.content, this.meta, this.attributes)
        bee.location = this.location

        bee.replace = this.replace

        if (this.bee_script.length != 0)
            bee.bee_script = this.bee_script.map(item => {
                const new_script = item.copy()
                return new_script
                    .set_replace(
                        { query_bee_script: new_script.replace.query_bee_script.replace(/\[v-\w+\]/gm, `[v-${bee.token}]`) })
            })
        if (this.bee_style.length != 0)
            bee.bee_style = this.bee_style.map(item => {
                const new_style = item.copy()
                return new_style
                    .set_replace(
                        { query_bee_style: new_style.replace.query_bee_style.replace(/\[v-\w+\]/gm, `[v-${bee.token}]`) })
            })
        if (this.children.length != 0)
            bee.children = this.children.map(item => { return item.copy() })
        return bee
    }
}
export class Hive {
    name: string
    html: string[]
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
            const worker_ref = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            const worker_ = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker')]
            refs.forEach(item => {
                worker_ref[item.getAttribute('ref')] = item
            })
            Object.entries(worker_).forEach(([key, value]) => {
                if (key.startsWith('onload_'))
                    (value as Function)()
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
    hive_html(to_replace: Book<string> = {}, clear_replaces: boolean = true) {
        this.bee_script.content = `const worker_bee_hive = {hive_${this.name}: {${this.bee_script_aggregator.join(',')}}, hive_${this.name}_ref: {}}`
        this.bee_script.attributes['worker'] = `hive_${this.name}`

        this.separate_scripts()
        this.ref()
        this.html = [this.bee_styles, this.bees, this.bee_scripts].map(item => item.map(bee => {
            bee.set_replace(to_replace)
            return bee.to_bee_html(clear_replaces)
        }).join(''))

        return this.html.join('')
    }
    to_html(to_replace: Book<string> = {}, remove_useless_replace: boolean = true) {
        let html = this.html[1]
        if (!to_replace) return remove_useless_replace ?
            this.html[0] + html.replaceAll(/(?<!\\)>{\s*[\S\s]*\s*}/gm, '') + this.html[2] : this.html.join('')

        Object.entries(to_replace).forEach(([key, value]) => {
            html = html.replaceAll(new RegExp(`(?<!\\\\)>{\\s*${key}\\s*}`, 'gm'), value)
        })
        return remove_useless_replace ?
            this.html[0] + html.replaceAll(/(?<!\\)>{\s*[\S\s]*\s*}/gm, '') + this.html[2] : this.html.join('')
    }
}
