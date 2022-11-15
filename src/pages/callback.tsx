import { useEffect } from 'react'
import { SpotifyAuthListener } from 'react-spotify-auth'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'

export default function Callback() {
    const router = useRouter()
    useEffect(() => {
        const timeout = setTimeout(() => {
            const cookie = Cookies.get("spotifyAuthToken")
            if(cookie) {
                router.replace("/square")
            } else {
                router.replace("/")
            }
        }, 30)
        return () => clearTimeout(timeout)
    }, [router])

    return <SpotifyAuthListener/>
}