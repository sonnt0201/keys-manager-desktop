import { useEffect, useState } from 'react'
import UpdateElectron from './components/update'
import logoVite from './assets/logo-vite.svg'
import logoElectron from './assets/logo-electron.svg'
import './App.css'
import AuthPage from './pages/auth'
import { useEntryAuthState } from './hooks/useAuthState'
import DashboardPage from './pages/dashboard'
import { SecondAuthRegisterCheck } from './pages/auth/SecondAuthRegisterCheck'
function App() {
  const [count, setCount] = useState(0)

  // const {authState, updateAuthState} = useEntryAuthState();
  const [authState, setAuthState] = useState<EntryAuthResult | "loading" | null>("loading")

  /** to receive auth all done state from {@link AuthPage} */ 
  const [authAllDone, setAuthAllDone]  = useState(false)

  useEffect(() => {
    window.ipcRenderer.echo("Hello from Renderer!").then((res) => {
      console.log('Echo response:', res)
    })

    bindEntryAuthListener()
    console.log("current auth state: ", authState)
    return () => {
      window.ipcRenderer.removeAllListener();
    }
  }, [])

  const bindEntryAuthListener = async () => {

    const result = await window.ipcRenderer.authState();
    setAuthState(result)

     window.ipcRenderer.onEntryAuthUpdated(state => {
     console.log("Receive new auth state from main process: ", state)
      setAuthState(state)
    })

  }

  useEffect(() => {
    //  window.location.reload()
    console.log("Current auth state: ", authState)
    //  if (authState === "not-logged-in") window.location.reload()

  },[authState])

  return (
    <div className='App'>
      {!authAllDone && <AuthPage authState={authState} 
      allDone={() => setAuthAllDone(true)}
      />}
      
     

      { authAllDone && (
        <DashboardPage />
      )}

    </div>
  )
}

export default App