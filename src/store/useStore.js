import { create } from 'zustand'
import { nanoid } from 'nanoid'

// 상태: 'arriving' | 'moving' | 'waiting' | 'arrived'
const MOCK_ROOM = {
  id: 'demo-room-001',
  title: '강남역 점심 🍜',
  destination: { name: '강남역 12번 출구', lat: 37.4979, lng: 127.0276 },
  meetingTime: Date.now() + 12 * 60 * 1000, // 12분 후
  penalties: ['아메리카노 쏘기 ☕', '밥 사기 🍚', '노래방 탬버린 담당 🎵', '다음 약속 장소 결정 📍', '사진 찍힘 📸'],
  hostId: 'user-001',
}

const MOCK_MEMBERS = [
  { id: 'user-001', nickname: '불꽃감자', emoji: '🔥', color: '#FF4D00', lat: 37.501, lng: 127.031, status: 'moving', eta: 8, isHost: true },
  { id: 'user-002', nickname: '지각왕민수', emoji: '🐌', color: '#0047FF', lat: 37.508, lng: 127.025, status: 'waiting', eta: 18, isHost: false },
  { id: 'user-003', nickname: '총알기차', emoji: '⚡', color: '#00FF88', lat: 37.499, lng: 127.028, status: 'arrived', eta: 0, isHost: false },
  { id: 'user-004', nickname: '미지의인물', emoji: '👻', color: '#FF0080', lat: 37.512, lng: 127.034, status: 'moving', eta: 22, isHost: false },
]

export const useStore = create((set, get) => ({
  // 방 정보
  room: null,
  members: [],
  myId: 'user-001',
  myNickname: '',
  myEmoji: '🙂',
  isHost: false,
  phase: 'lobby', // 'lobby' | 'live' | 'roulette' | 'done'

  // 재촉하기 쿨타임 맵 { userId: timestamp }
  nudgeCooldowns: {},

  // 룰렛 결과
  rouletteResult: null,
  rouletteTargets: [],

  // 데모 방 진입
  loadDemoRoom: () => {
    set({
      room: MOCK_ROOM,
      members: MOCK_MEMBERS,
      myId: 'user-001',
      myNickname: '불꽃감자',
      isHost: true,
      phase: 'live',
    })

    // 위치 시뮬레이션 (데모용)
    setInterval(() => {
      set(state => ({
        members: state.members.map(m => {
          if (m.status === 'arrived') return m
          if (m.status === 'waiting') return m
          const deltaLat = (Math.random() - 0.5) * 0.0005
          const deltaLng = (Math.random() - 0.5) * 0.0005
          const newEta = Math.max(0, m.eta - (Math.random() * 0.3))
          const newStatus = newEta <= 1 ? 'arrived' : m.status
          return { ...m, lat: m.lat + deltaLat, lng: m.lng + deltaLng, eta: newEta, status: newStatus }
        })
      }))
    }, 3000)
  },

  // 방 생성
  createRoom: (data) => {
    const roomId = nanoid(8)
    const room = { id: roomId, ...data, hostId: get().myId }
    set({ room, phase: 'live' })
    return roomId
  },

  // 내 위치 업데이트
  updateMyLocation: (lat, lng) => {
    const myId = get().myId
    set(state => ({
      members: state.members.map(m =>
        m.id === myId ? { ...m, lat, lng } : m
      )
    }))
  },

  // 재촉하기
  nudge: (targetId) => {
    const now = Date.now()
    const cooldowns = get().nudgeCooldowns
    const last = cooldowns[targetId] || 0

    if (now - last < 30000) {
      return { ok: false, remainSec: Math.ceil((30000 - (now - last)) / 1000) }
    }
    set(state => ({
      nudgeCooldowns: { ...state.nudgeCooldowns, [targetId]: now }
    }))
    return { ok: true }
  },

  // 룰렛 시작
  startRoulette: () => {
    const { members, room } = get()
    const latecomers = members.filter(m => m.status !== 'arrived')
    set({
      phase: 'roulette',
      rouletteTargets: latecomers.length > 0 ? latecomers : members,
    })
  },

  // 룰렛 결과 설정
  setRouletteResult: (member, penalty) => {
    set({ rouletteResult: { member, penalty }, phase: 'done' })
  },

  // 닉네임/이모지 설정
  setProfile: (nickname, emoji) => {
    const myId = `user-${nanoid(6)}`
    set(state => ({
      myId,
      myNickname: nickname,
      myEmoji: emoji,
      members: [...state.members, {
        id: myId, nickname, emoji, color: '#FFE600',
        lat: null, lng: null, status: 'waiting', eta: null, isHost: false
      }]
    }))
  },
}))
