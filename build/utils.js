"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeToCssStyle = exports.getContent = exports.recursiveGetContent = exports.getMetaAndTag = void 0;
const const_1 = require("./const");
const getMetaAndTag = (_meta, _attr = {}) => {
    let meta = _meta.matchAll(const_1.regex.meta).next().value;
    if (!meta)
        return;
    meta = { ...JSON.parse(JSON.stringify(meta.groups)), ..._attr };
    const tag = meta.tag;
    delete meta.tag;
    meta = Object.entries(meta)
        .map(([key, value]) => {
        if (key == 'tag')
            return null;
        return `${key}${value ? `="${value}"` : ''}`;
    })
        .filter((item) => !!item);
    return { tag: tag ? tag : 'div', meta };
};
exports.getMetaAndTag = getMetaAndTag;
const recursiveGetContent = (content) => {
    Object.entries(const_1.regex.style).forEach(([key, value]) => {
        if (content.match(value)) {
            content = content.replaceAll(value, `<${key}>$1</${key}>`);
        }
    });
    if (content.match(const_1.regex.style_general))
        content = (0, exports.recursiveGetContent)(content);
    return content;
};
exports.recursiveGetContent = recursiveGetContent;
const getContent = (content) => {
    content = (0, exports.recursiveGetContent)(content);
    content = content.replaceAll(/\n/gm, '<br>');
    content = content.replaceAll(/(?<!\\)\\/gm, '');
    return content;
};
exports.getContent = getContent;
const changeToCssStyle = (key) => {
    return key.replaceAll(const_1.regex.style_css, '$1-$2').toLowerCase();
};
exports.changeToCssStyle = changeToCssStyle;
