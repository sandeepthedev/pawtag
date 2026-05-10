import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { toPng } from 'html-to-image'

function QRCard({ uid, petId }) {
    const qrRef = useRef()
    const profileUrl = `${window.location.origin}/pet/${uid}/${petId}`

    const handleDownload = async () => {
        const dataUrl = await toPng(qrRef.current)
        const link = document.createElement('a')
        link.download = 'pawtag-qr.png'
        link.href = dataUrl
        link.click()
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Your PawTag QR</h2>
            <div ref={qrRef} className="p-4 bg-white rounded-xl">
                <QRCodeCanvas value={profileUrl} size={200} />
            </div>
            <p className="text-xs text-gray-400 text-center break-all">{profileUrl}</p>
            <button
                onClick={handleDownload}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium transition"
            >
                Download QR
            </button>
        </div>
    )
}

export default QRCard