export type ComponentOptions = {
    nonparse?: boolean
    ignore?: boolean
}

export type Book<T> = { [index: string]: T }
