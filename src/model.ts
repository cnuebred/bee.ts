import { Bee, Hive } from './hive'

const blog_style = (): Hive => {
  const hive = new Hive('blog_style')
    .style('hr', { border: 'solid #1e2124 1.75px', background: '#1e2124', borderRadius: '10px' })
    .style('body', { margin: '0px' })

  hive.add(`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400&display=swap');
    body{font-family: 'Montserrat', sans-serif;}`, 'style')

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
  hive.style('pre:hover', { opacity: '0.8' })
  hive.style('li', {
    margin: '10px'
  })

  return hive
}
export const bee_package: { [index: string]: any } = {
  blog_style
}