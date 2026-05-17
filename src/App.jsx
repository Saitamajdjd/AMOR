import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Creator from './pages/Creator'
import Success from './pages/Success'
import Gift from './pages/Gift'

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/criar" element={<Creator />} />
        <Route path="/sucesso" element={<Success />} />
        <Route path="/presente/:slug" element={<Gift />} />
      </Routes>
    </div>
  )
}

export default App