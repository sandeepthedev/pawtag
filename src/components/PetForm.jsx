import { useState } from 'react'
import { getAuth } from 'firebase/auth'
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import db from '../firebase/db'

function PetForm({ onComplete, showOwnerFields = true }) {
    const [petName, setPetName] = useState('')
    const [species, setSpecies] = useState('')
    const [breed, setBreed] = useState('')
    const [dob, setDob] = useState('')
    const [ownerName, setOwnerName] = useState('')
    const [contacts, setContacts] = useState([''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addContact = () => {
        if (contacts.length < 5) setContacts([...contacts, ''])
    }

    const removeContact = (index) => {
        if (contacts.length === 1) return
        setContacts(contacts.filter((_, i) => i !== index))
    }

    const handleContactChange = (index, value) => {
        const updated = [...contacts]
        updated[index] = value
        setContacts(updated)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const auth = getAuth()
            const user = auth.currentUser
            if (!user) throw new Error("No user logged in")

            // 1. Save Pet Data
            const petRef = await addDoc(collection(db, 'users', user.uid, 'pets'), {
                name: petName,
                species,
                breed,
                dob,
                createdAt: serverTimestamp()
            })

            // 2. Save Owner Info if provided
            if (showOwnerFields) {
                if (ownerName) {
                    await setDoc(doc(db, 'users', user.uid), {
                        name: ownerName,
                        updatedAt: serverTimestamp()
                    }, { merge: true })
                }

                // 3. Save Contacts
                for (const phone of contacts) {
                    if (phone.trim()) {
                        await addDoc(collection(db, 'users', user.uid, 'contacts'), {
                            phone: phone.trim(),
                            label: 'primary',
                            createdAt: serverTimestamp()
                        })
                    }
                }
            }

            if (onComplete) onComplete(petRef.id)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-6">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pet Details</h3>
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Pet Name</label>
                    <input
                        type="text"
                        placeholder="Enter pet name"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Species (Optional)</label>
                        <input
                            type="text"
                            placeholder="Dog, Cat, etc."
                            value={species}
                            onChange={(e) => setSpecies(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Breed (Optional)</label>
                        <input
                            type="text"
                            placeholder="Golden Retriever"
                            value={breed}
                            onChange={(e) => setBreed(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm text-gray-600 mb-1 block">Date of Birth (Optional)</label>
                    <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
            </div>

            {showOwnerFields && (
                <div className="pt-6 border-t border-gray-100 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Owner Details</h3>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Owner Name</label>
                        <input
                            type="text"
                            placeholder="Enter owner name"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Contact numbers</label>
                        <div className="space-y-2">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="tel"
                                        placeholder={`Contact ${index + 1}`}
                                        value={contact}
                                        onChange={(e) => handleContactChange(index, e.target.value)}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                    {contacts.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeContact(index)}
                                            className="text-red-400 hover:text-red-600 text-lg px-2"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {contacts.length < 5 && (
                            <button
                                type="button"
                                onClick={addContact}
                                className="mt-2 text-sm text-orange-500 hover:underline"
                            >
                                + Add another contact
                            </button>
                        )}
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 transition disabled:opacity-50"
            >
                {loading ? 'Registering...' : 'Register Pet'}
            </button>
        </form>
    )
}

export default PetForm