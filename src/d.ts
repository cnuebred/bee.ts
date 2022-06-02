export type ComponentOptions = {
    nonparse?: boolean
    ignore?: boolean
}

export type Book<T> = { [index: string]: T }
export type CssProperties =
    'accentColor' | 'alignContent' | 'alignItems' | 'alignSelf' | 'all' |
    'animation' | 'animationDelay' | 'animationDirection' | 'animationDuration' |
    'animationFillMode' | 'animationIterationCount' | 'animationName' | 'animationPlayState' |
    'animationTimingFunction' | 'backdropFilter' | 'backfaceVisibility' | 'background' |
    'backgroundAttachment' | 'backgroundBlendMode' | 'backgroundClip' | 'backgroundColor' |
    'backgroundImage' | 'backgroundOrigin' | 'backgroundPosition' | 'backgroundRepeat' | 'backgroundSize' |
    'border' | 'borderBottom' | 'borderBottomColor' | 'borderBottomLeftRadius' |
    'borderBottomRightRadius' | 'borderBottomStyle' | 'borderBottomWidth' | 'borderCollapse' |
    'borderColor' | 'borderImage' | 'borderImageOutset' | 'borderImageRepeat' | 'borderImageSlice' | 'borderImageSource' |
    'borderImageWidth' | 'borderLeft' | 'borderLeftColor' | 'borderLeftStyle' |
    'borderLeftWidth' | 'borderRadius' | 'borderRight' | 'borderRightColor' |
    'borderRightStyle' | 'borderRightWidth' | 'borderSpacing' | 'borderStyle' | 'borderTop' |
    'borderTopColor' | 'borderTopLeftRadius' | 'borderTopRightRadius' | 'borderTopStyle' | 'borderTopWidth' |
    'borderWidth' | 'bottom' | 'boxDecorationBreak' | 'boxShadow' | 'boxSizing' | 'breakAfter' |
    'breakBefore' | 'breakInside' | 'captionSide' | 'caretColor' | '@charset' | 'clear' | 'clip' |
    'clipPath' | 'color' | 'columnCount' | 'columnFill' | 'columnGap' | 'columnRule' | 'columnRuleColor' |
    'columnRuleStyle' | 'columnRuleWidth' | 'columnSpan' | 'columnWidth' | 'columns' | 'content' |
    'counterIncrement' | 'counterReset' | 'cursor' | 'direction' | 'display' | 'emptyCells' |
    'filter' | 'flex' | 'flexBasis' | 'flexDirection' | 'flexFlow' | 'flexGrow' | 'flexShrink' |
    'flexWrap' | 'float' | 'font' | '@fontFace' | 'fontFamily' | 'fontFeatureSettings' |
    'fontKerning' | 'fontSize' | 'fontSizeAdjust' | 'fontStretch' | 'fontStyle' | 'fontVariant' |
    'fontVariantCaps' | 'fontWeight' | 'gap' | 'grid' | 'gridArea' | 'gridAutoColumns' |
    'gridAutoFlow' | 'gridAutoRows' | 'gridColumn' | 'gridColumnEnd' | 'gridColumnGap' |
    'gridColumnStart' | 'gridGap' | 'gridRow' | 'gridRowEnd' | 'gridRowGap' | 'gridRowStart' |
    'gridTemplate' | 'gridTemplateAreas' | 'gridTemplateColumns' | 'gridTemplateRows' | 'hangingPunctuation' |
    'height' | 'hyphens' | 'imageRendering' | '@import' | 'isolation' | 'justifyContent' |
    '@keyframes' | 'left' | 'letterSpacing' | 'lineHeight' | 'listStyle' |
    'listStyleImage' | 'listStylePosition' | 'listStyleType' | 'margin' | 'marginBottom' |
    'marginLeft' | 'marginRight' | 'marginTop' | 'maskImage' | 'maskMode' | 'maskOrigin' |
    'maskPosition' | 'maskRepeat' | 'maskSize' | 'maxHeight' | 'maxWidth' | '@media' |
    'minHeight' | 'minWidth' | 'mixBlendMode' | 'objectFit' | 'objectPosition' | 'opacity' |
    'order' | 'orphans' | 'outline' | 'outlineColor' | 'outlineOffset' | 'outlineStyle' |
    'outlineWidth' | 'overflow' | 'overflowWrap' | 'overflowX' | 'overflowY' | 'padding' |
    'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'pageBreakAfter' | 'pageBreakBefore' | 'pageBreakInside' |
    'perspective' | 'perspectiveOrigin' | 'pointerEvents' | 'position' | 'quotes' | 'resize' | 'right' | 'rowGap' |
    'scrollBehavior' | 'tabSize' | 'tableLayout' | 'textAlign' | 'textAlignLast' | 'textDecoration' | 'textDecorationColor' |
    'textDecorationLine' | 'textDecorationStyle' | 'textDecorationThickness' | 'textIndent' |
    'textJustify' | 'textOverflow' | 'textShadow' | 'textTransform' | 'top' | 'transform' |
    'transformOrigin' | 'transformStyle' | 'transition' | 'transitionDelay' | 'transitionDuration' |
    'transitionProperty' | 'transitionTimingFunction' | 'unicodeBidi' | 'userSelect' | 'verticalAlign' |
    'visibility' | 'whiteSpace' | 'widows' | 'width' | 'wordBreak' | 'wordSpacing' |
    'wordWrap' | 'writingMode' | 'zIndex'



export type CssPropertiesBook = {
    [K in CssProperties]?: string
}