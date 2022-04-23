export const regex = {
    meta: /(?<tag>\w*)?(\#(?<id>\w*))?(\.(?<class>\w*))?/gm,
    style_general: /(?<!\\)(b|i|u)\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
    style_css: /([a-z])([A-Z])/gm,
    loop_item: /(?<!\\)\@(\d*)/gm,
    style: {
        b: /(?<!\\)b\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        i: /(?<!\\)i\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        u: /(?<!\\)u\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        s: /(?<!\\)s\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        sup: /(?<!\\)l\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        sub: /(?<!\\)t\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
        mark: /(?<!\\)m\((?<content>([\s\S](?!(?<!\\)(\S\([\s\S]+?\))))+?)(?<!\\)\)/gm,
    },
}

export const defaultEventActions: { [index: string]: string } = {
    on_click: 'click',
    on_move: 'mousemove',
}
