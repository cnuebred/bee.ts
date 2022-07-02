import { Hive } from './hive'

const blog_style = (): Hive => {
  const hive = new Hive('blog_style')
    .style('hr', { border: 'solid #1e2124 1.75px', background: '#1e2124', borderRadius: '10px' })
    .style('body', { margin: '0px' })

  hive.style('body,button', {
    fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
  })

  hive.style('::-webkit-scrollbar', { width: '7.5px', height: '7.5px' })
  hive.style('::-webkit-scrollbar-track', { background: '#f1f1f1', borderRadius: '2px' })
  hive.style('::-webkit-scrollbar-thumb', { background: '#888', borderRadius: '2px' })
  hive.style('::-webkit-scrollbar-thumb:hover', { background: '#555' })

  hive.style('pre', {
    background: '#1e2124',
    height: 'fit-content',
    overflowX: 'auto',
    borderRadius: '3px',
    color: 'white',
    padding: '7.5px',
    transition: 'opacity ease 0.4s',
  })
  hive.style('pre:hover', { opacity: '0.9' })
  hive.style('li', {
    margin: '10px',
  })

  hive.style('.site_blog', {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
  })
  hive.style('.center_blog', {
    position: 'absolute',
    top: '50px',
    width: '80%',
    margin: 'auto',
  })
  hive.style('.pre_block_blog', {
    padding: '3px',
    paddingLeft: '4.5px',
    paddingRight: '4.5px',
    borderRadius: '3px',
    color: 'white',
    background: '#0f0f12',
  })
  hive.style('.pointer_blog', {
    cursor: 'pointer',
  })
  hive.style('.noselect_blog', {
    '-webkit-touch-callout': 'none',
    '-webkit-user-select': 'none',
    '-khtml-user-select': 'none',
    '-moz-user-select': 'none',
    '-ms-user-select': 'none',
    'userSelect': 'none',
  })
  hive.style('select', {
    outline: 'none',
    padding: '3.5px',
    paddingLeft: '15px',
    paddingRight: '15px',
    borderRadius: '3px',
    border: 'none',
    overflow: 'hidden',
    appearance: 'none',
    cursor: 'pointer',
    background: '#d8d8d8',
    transition: 'opacity 0.1s ease',
  })
  hive.style('select:hover', {
    opacity: '0.8',
  })
  hive.style('blockquote', {
    padding: '3px',
    marginLeft: '0',
    paddingLeft: '25px',
    paddingRight: '4.5px',
    borderRadius: '2px',
    borderLeft: 'solid #1e2124 3px',
  })
  hive.style('button', {
    outline: 'none',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.1s ease',
  })
  hive.style('button:hover', {
    opacity: '0.8',
  })
  hive.style('button:active', {
    opacity: '0.2',
  })
  hive.style('table', {
    borderRadius: '3px',
    borderCollapse: 'collapse'
  })
  hive.style('table tr, table td', {
    border: '#1e2124 solid 2px',
    borderRadius: '3px',
    padding: '5px',
    paddingLeft: '7px',
    paddingRight: '7px'
  })
  return hive
}

const std_libs = (...args: string[]): Hive => {
  const hive = new Hive('libs')
  if (args.includes('highlight')) {
    hive.add('', 'link',
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/monokai.min.css' }
    )
    hive.add('', 'script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/highlight.min.js' })
    hive.add('hljs.initHighlightingOnLoad()', 'script')
    hive.script({
      _highlight() { return eval('hljs') }
    })
  }
  if (args.includes('crypto')) {
    hive.add('', 'script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js' })
    hive.script({
      _crypto() { return eval('CryptoJS') }
    })
  }
  if (args.includes('axios')) {
    hive.add('', 'script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js' })
    hive.script({
      _axios() { return eval('axios') }
    })
  }

  return hive
}

export const bee_package: { [index: string]: (...args: string[]) => Hive } = {
  blog_style,
  std_libs
}
