import { useEffect, useState } from 'react'
import UpdateElectron from './components/update'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import './App.css'
import  AuthPage from './pages/auth'
import { useEntryAuthState } from './hooks/useAuthState'
import DashboardPage from './pages/dashboard'
function App() {
  const [count, setCount] = useState(0)

  const {authState, updateAuthState} = useEntryAuthState();
  
  useEffect(() => {
    window.ipcRenderer.echo("Hello from Renderer!").then((res) => {
      console.log('Echo response:', res)
    })

    return () => {
      window.ipcRenderer.removeAllListener();
    }
  },[])

  

  return (
    <div className='App'>
     {authState !== "logged-in" && <AuthPage onEntryAuthCompleted={() => updateAuthState()}/> }
      {authState === "logged-in" && (
        <DashboardPage />
      )}
     
    </div>
  )
}

export default App