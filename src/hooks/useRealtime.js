/**
 * useRealtime.js
 * 실시간 위치 추적 + Supabase 구독 통합 훅
 */
import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'
import { startLocationTracking, calcEtaMinutes, calcStatus } from '../lib/geolocation'
import { updateLocation, subscribeMembersRealtime, fetchMembers } from '../lib/roomService'
import { isSupabaseReady } from '../lib/supabase'

export function useRealtime(roomId) {
  const myId   = useStore(s => s.myId)
  const room   = useStore(s => s.room)
  const setMemberLocation   = useStore(s => s.setMemberLocation)
  const updateMembersFromDB = useStore(s => s.updateMembersFromDB)

  const unsubGeoRef      = useRef(null)
  const unsubRealtimeRef = useRef(null)
  const lastUpdateRef    = useRef(0)

  const startTracking = useCallback(() => {
    if (unsubGeoRef.current) return

    unsubGeoRef.current = startLocationTracking(
      async ({ lat, lng }) => {
        const now = Date.now()
        if (now - lastUpdateRef.current < 5000) return
        lastUpdateRef.current = now

        const dest   = room?.destination
        const eta    = dest ? calcEtaMinutes(lat, lng, dest.lat, dest.lng) : null
        const status = calcStatus(eta)

        setMemberLocation(myId, lat, lng, eta, status)
        if (isSupabaseReady()) await updateLocation(myId, lat, lng, eta, status)
      },
      err => console.warn('[GPS]', err)
    )
  }, [myId, room, setMemberLocation])

  useEffect(() => {
    if (!roomId || !isSupabaseReady()) return

    fetchMembers(roomId).then(members => {
      if (members.length > 0) updateMembersFromDB(members)
    })

    unsubRealtimeRef.current = subscribeMembersRealtime(roomId, updatedMember => {
      updateMembersFromDB([updatedMember])
    })

    return () => unsubRealtimeRef.current?.()
  }, [roomId])

  useEffect(() => {
    startTracking()
    return () => { unsubGeoRef.current?.(); unsubGeoRef.current = null }
  }, [startTracking])
}
