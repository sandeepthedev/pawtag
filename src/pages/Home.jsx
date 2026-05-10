import { useState, useEffect } from 'react'
import { logout } from '../firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'
import db from '../firebase/db'
import PetForm from '../components/PetForm'
import PetCard from '../components/PetCard'
import ProfileModal from '../components/ProfileModal'

function Home() {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [pets, setPets] = useState([])
    const [loading, setLoading] = useState(true)
    const [showPetForm, setShowPetForm] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)

    useEffect(() => {
        const auth = getAuth()
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u)
                fetchUserData(u.uid)
            } else {
                navigate('/')
            }
        })
        return () => unsubscribe()
    }, [navigate])

    const fetchUserData = async (uid) => {
        try {
            // Fetch Profile
            const profileDoc = await getDoc(doc(db, 'users', uid))
            if (profileDoc.exists()) {
                setProfile(profileDoc.data())
            }

            // Fetch Pets
            const petsQuery = query(
                collection(db, 'users', uid, 'pets'),
                orderBy('createdAt', 'desc')
            )
            const petsSnapshot = await getDocs(petsQuery)
            const petsList = petsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPets(petsList)
            
            // If no pets, auto-show form
            if (petsList.length === 0) {
                setShowPetForm(true)
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    const handlePetComplete = () => {
        setShowPetForm(false)
        fetchUserData(user.uid)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 sticky top-0 z-40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-2xl font-black italic tracking-tighter">🐾 PawTag</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setShowProfileModal(true)}
                        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-4 rounded-full transition border border-transparent hover:border-gray-100"
                    >
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                            {profile?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-sm font-bold text-gray-700 hidden sm:block">
                            {profile?.name || 'Owner Profile'}
                        </span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 transition p-2"
                        title="Logout"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="max-w-xl mx-auto px-4 py-8">
                {showPetForm ? (
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            {pets.length > 0 && (
                                <button 
                                    onClick={() => setShowPetForm(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            )}
                            <h2 className="text-2xl font-bold text-gray-800">
                                {pets.length === 0 ? 'Register your first pet' : 'Add new pet'}
                            </h2>
                        </div>
                        <PetForm 
                            onComplete={handlePetComplete} 
                            showOwnerFields={pets.length === 0}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Your Pets</h1>
                                <p className="text-sm text-gray-500">{pets.length} pet{pets.length !== 1 ? 's' : ''} registered</p>
                            </div>
                            <button
                                onClick={() => setShowPetForm(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Pet
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {pets.map(pet => (
                                <PetCard 
                                    key={pet.id} 
                                    pet={pet} 
                                    onEdit={(p) => navigate(`/pet/${user.uid}/${p.id}`)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showProfileModal && (
                <ProfileModal 
                    user={user}
                    profile={profile}
                    onClose={() => setShowProfileModal(false)}
                    onUpdate={() => {
                        setShowProfileModal(false)
                        fetchUserData(user.uid)
                    }}
                />
            )}
        </div>
    )
}

export default Home