import { Bee } from './bee'

export const base_style = (): Bee => {
    const bee = new Bee('cube_style')
    bee.add(
        `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap'); body{font-family: 'Montserrat', sans-serif;}`,
        'style'
    )
    bee.add(
        `::-webkit-scrollbar {
        width: 7.5px;
        height: 7.5px
      }
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
    }
    ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 2px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }`,
        'style'
    )
    bee.style('pre', {
        background: '#1e2124',
        minWidth: 'auto',
        overflowX: 'auto',
        borderRadius: '3px',
        color: 'white',
        padding: '7.5px',
        transition: 'opacity ease 0.4s',
    })
    bee.style('pre:hover', { opacity: '0.8' })
    bee.style('hr', { border: 'solid #1e2124 1.75px', background: '#1e2124', borderRadius: '10px' })
    bee.style('button#regular_button', {
        border: 'none',
        background: '#1e2124',
        borderRadius: '3px',
        color: 'white',
        padding: '7.5px',
        fontFamily: 'Montserrat, sans-serif',
    })
    bee.style('body', { margin: '30px' })
    return bee
}
