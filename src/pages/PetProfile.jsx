import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import db from '../firebase/db'
import QRCard from '../components/QRCard'

function PetProfile() {
    const { uid, petId } = useParams()
    const [petData, setPetData] = useState(null)
    const [ownerData, setOwnerData] = useState(null)
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch pet
                const petRef = doc(db, 'users', uid, 'pets', petId)
                const petSnap = await getDoc(petRef)
                
                if (!petSnap.exists()) {
                    setError('Pet profile not found.')
                    setLoading(false)
                    return
                }
                setPetData(petSnap.data())

                // Fetch owner
                const ownerRef = doc(db, 'users', uid)
                const ownerSnap = await getDoc(ownerRef)
                if (ownerSnap.exists()) {
                    setOwnerData(ownerSnap.data())
                }

                // Fetch contacts
                const contactsRef = collection(db, 'users', uid, 'contacts')
                const contactsSnap = await getDocs(contactsRef)
                const contactsList = contactsSnap.docs.map(d => d.data().phone)
                setContacts(contactsList)

            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [uid, petId])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
            Loading...
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center text-red-500 text-sm">
            {error}
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4">
                <span className="text-orange-500 text-xl font-bold">🐾 PawTag</span>
            </nav>
            <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
                
                {/* Pet Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{petData.name}</h1>
                            <p className="text-orange-500 font-medium">{petData.species || 'Pet'}</p>
                        </div>
                    </div>
                    {(petData.breed || petData.dob) && (
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            {petData.breed && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">Breed:</span>
                                    <span>{petData.breed}</span>
                                </div>
                            )}
                            {petData.dob && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">DOB:</span>
                                    <span>{new Date(petData.dob).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Owner Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Owner details</h2>
                    <div>
                        <p className="text-sm text-gray-500">Owner name</p>
                        <p className="text-gray-800 font-medium">{ownerData?.name || 'Unknown'}</p>
                    </div>
                    {contacts.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Contact numbers</p>
                            <div className="space-y-2">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <a
                                            href={`tel:${contact}`}
                                            className="text-orange-500 font-medium hover:underline"
                                        >
                                            {contact}
                                        </a>
                                        <a
                                            href={`tel:${contact}`}
                                            className="md:hidden inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-orange-600 transition"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                            Call
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <QRCard uid={uid} petId={petId} />
            </div>
        </div>
    )
}

export default PetProfile