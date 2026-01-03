import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='text-amber-200'>
    helf
    <Button>Hello</Button>
      </div>
    </>
  )
}

export default App
