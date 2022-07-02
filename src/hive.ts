import { Bee } from './bee'
import { Book, CssPropertiesBook, HiveConfiguration } from './d'
import { bee_package } from './model'
import { default_config, change_to_css_style } from './utils'

export class Hive {
    name: string
    html: string[]
    bees: Bee[] = []
    config: HiveConfiguration
    private bee_styles: Bee[] = []
    private bee_scripts: Bee[] = []
    private bee_style: Bee = new Bee('', 'style')
    private bee_script: Bee = new Bee('', 'script')
    private bee_event: Bee = new Bee('', 'script')
    private bee_script_aggregator: string[] = []
    constructor(name: string, config: HiveConfiguration = {}) {
        this.name = name
        this.config = { ...config, ...default_config }

        this.bee_styles.push(this.bee_style)
        this.bee_scripts.push(this.bee_script)
        // this.bee_scripts.push(this.bee_event)
    }
    add(content?, meta?, attributes?): Bee {
        const bee: Bee = new Bee(content, meta, attributes)
        this.push(bee)
        return bee
    }
    add_package(direct_pcg: string | Hive, ...args: string[]): Hive {
        const pcg: Hive = typeof (direct_pcg) == 'string' ? bee_package[direct_pcg](...args) : direct_pcg
        this.bees.push(...pcg.bees)
        this.bee_scripts.push(...pcg.bee_scripts)
        this.bee_styles.push(...pcg.bee_styles)
        this.bee_script_aggregator.push(...pcg.bee_script_aggregator)
        return pcg
    }
    push(bee: Bee | Bee[]): Hive {
        const bee_array: Bee[] = Array.isArray(bee) ? bee : [bee]
        bee_array.forEach(bee => {
            if (bee.meta.tag == 'script') this.bee_scripts.push(bee)
            else if (bee.meta.tag == 'style') this.bee_style.push(bee)
            else this.bees.push(bee)
        })
        return this
    }
    style(query: string, style: CssPropertiesBook): Hive {
        let style_pcg: string = ''
        Object.entries(style).forEach(([key, value]) => {
            style_pcg += `${change_to_css_style(key)}: ${value};`
        })
        this.bee_style.content += query + `{${style_pcg}}`
        return this
    }
    script(script: { [index: string]: any }): Hive {
        Object.entries(script).forEach(([key, value]) => {
            if (typeof value == 'function') {
                const foo_string: string = value.toString()
                if (foo_string.startsWith('('))
                    this.bee_script_aggregator.push(`${key}:${foo_string}`)
                else
                    this.bee_script_aggregator.push(`${foo_string}`)
            }
            else
                return this.bee_script_aggregator.push(`${key}:${JSON.stringify(value)}`)
        })
        return this
    }
    private set_reference_script() {
        let worker_bee_hive: any
        const foo = async () => {
            const refs = document.querySelectorAll('[ref]')
            const worker_ref = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker') + '_ref']
            const worker_ = worker_bee_hive[document.querySelector('script[worker]').getAttribute('worker')]
            refs.forEach(item => {
                worker_ref[item.getAttribute('ref')] = item
            })
            Object.keys(worker_).forEach(async (key) => {
                if (key.startsWith('onload_'))
                    await (worker_[key] as Function)()
            })
        }
        this.bee_event.content = `(${foo.toString()})()`
        this.bee_scripts.push(this.bee_event)
    }
    private separate_scripts(group: Bee[] = this.bees) {
        group.forEach(bee => {
            if (bee.children.length != 0) this.separate_scripts(bee.children)
            if (bee.bee_script.length != 0)
                this.bee_scripts.push(...bee.bee_script)
            if (bee.bee_style.length != 0)
                this.bee_styles.push(...bee.bee_style)
        })
    }
    template_size() {
        if (this.html)
            return this.html.map(item => { return Buffer.byteLength(item) })
        return undefined
    }
    hive_html(to_replace: Book<string> = {}, clear_replaces: boolean = true) {
        this.bee_script.content = `const worker_bee_hive = {hive_${this.name}: `
            + `{${this.bee_script_aggregator.join(',')}}, hive_${this.name}_ref: {}}`

        this.bee_script.attributes['worker'] = `hive_${this.name}`

        this.separate_scripts()
        this.set_reference_script()
        this.html = [this.bee_styles, this.bees, this.bee_scripts].map(item => item.map(bee => {
            if (bee.content.length == 0 && Object.keys(bee.attributes).length == 0 && bee.children.length == 0)
                return
            if (bee.meta.tag == 'script' && bee.content.length != 0)
                bee.set_attributes('defer', '')

            bee.set_replace(to_replace)
            return bee.to_bee_html(clear_replaces)
        }).join(''))

        return this.html.join('')
    }
    template(to_replace: Book<string> = {}, remove_useless_replace: boolean = true): string {
        let scheme = JSON.parse(JSON.stringify(this.html))
        if (!to_replace) return remove_useless_replace ?
            scheme.map(item => { return item.replaceAll(/(?<!\\)>{{\s*[\S\s]*?\s*}}/gm, '') }).join('') : scheme.join('')

        Object.entries(to_replace).forEach(([key, value]) => {
            scheme = scheme.map(item => { return item.replaceAll(new RegExp(`(?<!\\\\)>{{\\s*${key}\\s*}}`, 'gm'), value) })
        })

        return remove_useless_replace ?
            scheme.map(item => { return item.replaceAll(/(?<!\\)>{{\s*[\S\s]*?\s*}}/gm, '') }).join('') : scheme.join('')
    }
}


// Add Config for example for placeholders in scheme