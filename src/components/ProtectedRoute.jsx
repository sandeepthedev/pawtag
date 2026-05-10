import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Navigate } from 'react-router-dom'
import auth from '../firebase/auth'

function ProtectedRoute({ children }) {
    const [user, setUser] = useState(undefined)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribe()
    }, [])

    if (user === undefined) return null
    if (!user) return <Navigate to="/" />
    return children
}

export default ProtectedRoute