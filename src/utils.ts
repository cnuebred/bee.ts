export const regex = {
    meta: /(^(?<tag>\w+))?(\#(?<id>\w+))?(\.(?<class>([a-zA-Z_@\-0-9.]+)*))?(\$(?<ref>(\w+)*))?/gm,
    for: /(?<!\\)\@(\d+)/gm,
    style_css: /([a-z])([A-Z])/gm,
    fetch_tags: /(?<!\/)@(\w+)/gm,
    replacer: /(?<!\\)>{{\s*[\S\s]*?\s*}/gm,
    bee_html: {
        general: /<(?<tag>\w+)?\s+(?<attr>\w+=\"[\S\s]+\")?\s+(?<token>\w+)?>(?<content>[\S\s]+?)<\/\1 \3>/gm,
        attr: /(?<key>\w+)="(?<value>[\S\s]+?)"/gm,
    },
    shorts: {
        style: /(?<!\\)(?<type>i|b|u|s|sub|sup|mark|code)\((?<content>[\S\s]+?)(?<!\\)\)/gm,
        header: /(?<!\\)(?<type>#{1,3})(?<content>[\s\S]+?)(?<!\\)\1/gm,
        blockquote: /(?<!\\)(?<type>^\>)(?<content>[\s\S]+?)(?<!\\)\</gm,
        hr: /(?<!\/)^\s*-{3}\s*$/gm,
    }
}
export const regex_shorts = {
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
        return content.replaceAll(regex.shorts.hr, '<hr>')
    },
    blockquote: (match, content) => {
        return content.replaceAll(regex.shorts.blockquote, '<blockquote>$2</blockquote>')
    }
}
export const block_attributes = ['replace']

export const default_config = {

}

export const extract_meta = (meta: string) => {
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
export const change_to_css_style = (key) => {
    return key.replaceAll(regex.style_css, '$1-$2').toLowerCase()
}
export const recursive_get_content = (key, content) => {
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
