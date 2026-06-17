/**
 * useRoomRestore.js
 * URL roomId 기반으로 방 상태를 복원하는 훅
 *
 * 동작 순서:
 * 1. sessionStorage에서 내 세션(memberId 등) 로드
 * 2. Supabase에서 방 정보 + 멤버 목록 fetch
 * 3. zustand store 복원
 * 4. 세션 없으면 → /join/:roomId 로 리다이렉트 (닉네임 재입력)
 * 5. Supabase 미연동 + 데모방 ID → 데모 모드
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { fetchRoom, fetchMembers } from '../lib/roomService'
import { isSupabaseReady } from '../lib/supabase'
import { loadSession, isSessionValid } from '../lib/session'

export function useRoomRestore(roomId) {
  const navigate      = useNavigate()
  const { room, initRoom, updateMembersFromDB, loadDemoRoom } = useStore(s => ({
    room:                s.room,
    initRoom:            s.initRoom,
    updateMembersFromDB: s.updateMembersFromDB,
    loadDemoRoom:        s.loadDemoRoom,
  }))

  // 'loading' | 'ok' | 'error' | 'redirect'
  const [restoreState, setRestoreState] = useState(
    room ? 'ok' : 'loading'
  )
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // 이미 store에 같은 방이 로드돼 있으면 복원 불필요
    if (room?.id === roomId) {
      setRestoreState('ok')
      return
    }

    // 데모 방 처리
    if (roomId === 'demo-room-001') {
      loadDemoRoom()
      setRestoreState('ok')
      return
    }

    restore()
  }, [roomId])

  async function restore() {
    setRestoreState('loading')

    // ── 1. 세션 확인 ──────────────────────────────────
    const session = loadSession()
    const hasValidSession = isSessionValid(roomId)

    // Supabase 미연동 → 세션만으로 복원 불가, 데모로 폴백
    if (!isSupabaseReady()) {
      if (hasValidSession) {
        // store에 최소 정보 복원 (실시간 없이)
        useStore.setState({
          myId:       session.memberId,
          myNickname: session.nickname,
          myEmoji:    session.emoji,
          isHost:     session.isHost,
        })
      }
      loadDemoRoom()
      setRestoreState('ok')
      return
    }

    try {
      // ── 2. Supabase에서 방 정보 로드 ────────────────
      const [roomData, members] = await Promise.all([
        fetchRoom(roomId),
        fetchMembers(roomId),
      ])

      if (!roomData) {
        setErrorMsg('방을 찾을 수 없어요. 링크를 확인해주세요.')
        setRestoreState('error')
        return
      }

      // ── 3. 세션 없거나 만료 → 닉네임 재입력 ─────────
      if (!hasValidSession) {
        setRestoreState('redirect')
        navigate(`/join/${roomId}`, { replace: true })
        return
      }

      // ── 4. store 복원 ────────────────────────────────
      const myMember = members.find(m => m.id === session.memberId) || {
        id:       session.memberId,
        nickname: session.nickname,
        emoji:    session.emoji,
        color:    '#4A7C9E',
        status:   'waiting',
        eta:      null,
        isHost:   session.isHost,
      }

      initRoom(roomData, myMember, session.isHost)
      updateMembersFromDB(members)
      setRestoreState('ok')

    } catch (e) {
      console.error('[useRoomRestore]', e)
      setErrorMsg('데이터를 불러오는 중 오류가 발생했어요.')
      setRestoreState('error')
    }
  }

  return { restoreState, errorMsg, retry: restore }
}
