function PetCard({ pet, onEdit }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition cursor-pointer" onClick={() => onEdit(pet)}>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-orange-500">
                    {pet.name}
                </h3>
                <span className="bg-orange-50 text-orange-600 text-[10px] uppercase font-bold px-2 py-1 rounded-md">
                    {pet.species || 'Pet'}
                </span>
            </div>
            
            <div className="space-y-1">
                {pet.breed && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">Breed:</span>
                        <span>{pet.breed}</span>
                    </div>
                )}
                {pet.dob && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">DOB:</span>
                        <span>{new Date(pet.dob).toLocaleDateString()}</span>
                    </div>
                )}
                {!pet.breed && !pet.dob && (
                    <p className="text-xs text-gray-400 italic">No additional details provided.</p>
                )}
            </div>

            <div className="mt-2 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] text-gray-400">Added {new Date(pet.createdAt?.toDate?.() || pet.createdAt).toLocaleDateString()}</span>
                <button className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                    View
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default PetCard
