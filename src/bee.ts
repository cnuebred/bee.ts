import { randomBytes } from 'crypto'
import { BeeLocation, BeeAttributes, Book, BeeMeta, BeeFetchOptions, BeeEvents, BeeEventCallback, CssPropertiesBook } from './d'
import { block_attributes, change_to_css_style, extract_meta, get_content, regex } from './utils'

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
        return `${this.meta.tag}${this.meta?.id ? '#' + this.meta.id : ''}${this.meta?.class ? '.'
            + this.meta.class.join('.') : ''}${token ? `[v-${this.token}] ` : ''}`
    }
    set_replace(obj: Book<string>) {
        this.replace = { ...this.replace, ...obj }
        return this
    }
    set_attributes(key, value) {
        this.attributes[key] = value
    }
    remove_attributes(key) {
        delete this.attributes[key]
    }
    private set_tag_attributes() {
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
        if (!this.replace) return remove_useless_replace ? content.replaceAll(regex.replacer, '') : content
        Object.entries(this.replace).forEach(([key, value]) => {
            content = content.replaceAll(new RegExp(`(?<!\\\\)>{{\\s*${key}\\s*}}`, 'gm'), value)
        })
        return remove_useless_replace ? content.replaceAll(regex.replacer, '') : content
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
            return location[location_type]
                .map(item => {
                    item.set_replace(this.replace)
                    return item.to_bee_html(remove_useless_replace)
                }).join(' ')
        }
        this.bee_script.forEach(item => {
            item.set_replace(this.replace)
        })
        this.bee_style.forEach(item => {
            item.set_replace(this.replace)
        })
        this.content = this.to_replace(this.content, remove_useless_replace)
        const base = `${location_bee('before')}<${this.meta.tag} v-${this.token} `
            + `${this.set_tag_attributes().join(' ')} >${location_bee('start')}`
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
            if (index == 0) new_bee = this
            else new_bee = construct_bee.copy()

            this.iterate((component) => {
                component.content = component.content.replaceAll(regex.for, (match, p1) => replacer(match, p1, item))
                component.meta = JSON.parse(JSON.stringify(component.meta)
                    .replaceAll(regex.for, (match, p1) => replacer(match, p1, item)))
                component.attributes = JSON.parse(JSON.stringify(component.attributes)
                    .replaceAll(regex.for, (match, p1) => replacer(match, p1, item)))
            }, new_bee)

            if (index != 0)
                this.push(new_bee, location)
        })
        return this
    }
    fetch(url: string, options: BeeFetchOptions, query: string = '') {// only for api json
        let worker_bee_hive: any
        const foo = async (url, token, options, headers, res) => {
            const element = document.querySelector(token)
            const worker = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker')]
            const ref = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            await fetch(url, {
                method: options?.method || 'get',
                headers: headers() || {},
                body: options?.data ? JSON.stringify(options?.data) : null,
                mode: options?.cors || 'cors',
            })
                .then(response => {
                    return options?.type_data == 'text' ? response.text() : response.json()
                })
                .then(result => {
                    const pcg = res({ result, worker, ref })
                    if (pcg) {
                        element.innerHTML = element.innerHTML
                            .replaceAll(/(?<!\/)@(\w+)/gm, (p, _1) => { return pcg[_1] || '' })
                        Object.values(element.attributes).forEach((item: Attr) => {
                            item.value = item.value.replaceAll(/(?<!\/)@(\w+)/gm, (p, _1) => { return pcg[_1] || '' })
                        })
                    }
                }).catch(err => { console.log(err) })
        }
        const headers = options.headers ? options.headers.toString() : '() => {}'
        const res = options.res ? options.res.toString() : '() => {}'

        let script = `(${foo.toString()})
        ('${url}', '>{{query_bee_script}}', ${JSON.stringify(options)}, ${headers}, ${res})`
        if (options?.on) {
            script = `document.querySelector('${options.on.query}').addEventListener('${options.on.event}', () => {${script}})`
        }
        const bee_script = new Bee(script, 'script')
        bee_script.set_replace({
            query_bee_script: `[v-${this.token}]${query ? ' ' + query : query}`
            , ...(options?.replacer || {})
        })
        this.bee_script.push(bee_script)
        return this
    }
    gist(address, file) {
        this.fetch(`https://api.github.com/gists/${address}`, {
            replacer: { _file_: file },
            res: ({ result }) => {
                const file_pcg = result.files['>{{_file_}}']
                return {
                    _gist_: file_pcg?.content
                        .replaceAll(/\</gm, '&lt;')
                        .replaceAll(/\>/gm, '&gt;')
                        .replaceAll(/ /gm, '&nbsp;')
                        .replaceAll(/\n/gm, '<br>') || ''
                }
            }
        })
        return this
    }
    wrap(meta?, attributes: BeeAttributes = {}, location: BeeLocation = 'end') {
        const copy = this.copy()
        copy.location = location
        this.meta = typeof meta == 'string' ? extract_meta(meta) : meta
        this.attributes = attributes || {}
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

        const script = new Bee(`(${foo.toString()})('${event}', '>{{query_bee_script}}' , ${callback.toString()})`, 'script')
        script.set_replace({ query_bee_script: `[v-${this.token}]${query ? ' ' + query : query}` })
        this.bee_script.push(script)
        return this
    }
    style(query: string, style: CssPropertiesBook, single: boolean = true) {
        let style_pcg = ''
        Object.entries(style).forEach(([key, value]) => {
            style_pcg += `${change_to_css_style(key)}: ${value};`
        })
        const bee_style = new Bee('>{{query_bee_style}} ' + query + `{${style_pcg}}`, 'style')
        bee_style.set_replace({ query_bee_style: this.query(single) })
        this.bee_style.push(bee_style)
        return this
    }
    click(callback: ({ item, event, worker, ref }: BeeEventCallback) => void, query: string = '') {
        this.event('click', callback, query)
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