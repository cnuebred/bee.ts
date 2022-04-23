import { regex } from './const'

export const getMetaAndTag = (_meta: string, _attr: { [index: string]: string } = {}) => {
    let meta = _meta.matchAll(regex.meta).next().value
    if (!meta) return
    meta = { ...JSON.parse(JSON.stringify(meta.groups)), ..._attr }
    const tag = meta.tag
    delete meta.tag

    meta = Object.entries(meta)
        .map(([key, value]) => {
            if (key == 'tag') return null
            return `${key}${value ? `="${value}"` : ''}`
        })
        .filter((item) => !!item)

    return { tag: tag ? tag : 'div', meta }
}
export const recursiveGetContent = (content) => {
    Object.entries(regex.style).forEach(([key, value]) => {
        if (content.match(value)) {
            content = content.replaceAll(value, `<${key}>$1</${key}>`)
        }
    })
    if (content.match(regex.style_general)) content = recursiveGetContent(content)
    return content
}
export const getContent = (content: string) => {
    content = recursiveGetContent(content)
    content = content.replaceAll(/\n/gm, '<br>')
    content = content.replaceAll(/(?<!\\)\\/gm, '')
    return content
}
export const changeToCssStyle = (key) => {
    return key.replaceAll(regex.style_css, '$1-$2').toLowerCase()
}
