import { useState, useEffect } from 'react'
import { doc, setDoc, collection, addDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import db from '../firebase/db'

function ProfileModal({ user, profile, onClose, onUpdate }) {
    const [name, setName] = useState(profile?.name || '')
    const [phone, setPhone] = useState(profile?.phone || '')
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showContactForm, setShowContactForm] = useState(false)
    const [newContact, setNewContact] = useState({ phone: '', label: 'primary' })

    useEffect(() => {
        if (user?.uid) {
            fetchContacts()
        }
    }, [user?.uid])

    const fetchContacts = async () => {
        const querySnapshot = await getDocs(collection(db, 'users', user.uid, 'contacts'))
        const fetchedContacts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        setContacts(fetchedContacts)
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await setDoc(doc(db, 'users', user.uid), {
                name,
                phone,
                updatedAt: serverTimestamp()
            }, { merge: true })
            onUpdate()
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddContact = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addDoc(collection(db, 'users', user.uid, 'contacts'), {
                ...newContact,
                createdAt: serverTimestamp()
            })
            setNewContact({ phone: '', label: 'primary' })
            setShowContactForm(false)
            fetchContacts()
        } catch (error) {
            console.error("Error adding contact:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteContact = async (contactId) => {
        if (!confirm('Are you sure you want to delete this contact?')) return
        try {
            await deleteDoc(doc(db, user.uid, 'contacts', contactId))
            fetchContacts()
        } catch (error) {
            console.error("Error deleting contact:", error)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Owner Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Primary Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                placeholder="Enter primary phone"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Update Profile'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Secondary Contacts</h3>
                            {!showContactForm && (
                                <button
                                    onClick={() => setShowContactForm(true)}
                                    className="text-xs text-orange-500 font-bold hover:underline"
                                >
                                    + Add Contact
                                </button>
                            )}
                        </div>

                        {showContactForm && (
                            <form onSubmit={handleAddContact} className="bg-orange-50 p-4 rounded-xl mb-4 space-y-3">
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="Phone number"
                                        value={newContact.phone}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={newContact.label}
                                        onChange={(e) => setNewContact({ ...newContact, label: e.target.value })}
                                        className="flex-1 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none bg-white"
                                    >
                                        <option value="primary">Primary</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-orange-500 text-white px-4 rounded-lg text-sm font-bold"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowContactForm(false)}
                                        className="bg-gray-200 text-gray-600 px-4 rounded-lg text-sm font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-2">
                            {contacts.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No additional contacts added.</p>
                            ) : (
                                contacts.map(contact => (
                                    <div key={contact.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{contact.phone}</p>
                                            <p className="text-xs text-gray-500 capitalize">{contact.label}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal
