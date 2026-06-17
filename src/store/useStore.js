import { create } from 'zustand'
import { nanoid } from 'nanoid'

const MCM_COLORS = ['#4A7C9E','#C9982A','#6B9E6E','#C27B5A','#7B7EC9','#9E6B6B','#6B9E9C']

// 데모용 목데이터
const MOCK_ROOM = {
  id: 'demo-room-001',
  title: '강남역 점심 🍜',
  destination: { name: '강남역 12번 출구', lat: 37.4979, lng: 127.0276 },
  meetingTime: Date.now() + 12 * 60 * 1000,
  penalties: ['아메리카노 쏘기 ☕','밥 사기 🍚','노래방 탬버린 담당 🎵','다음 약속 장소 결정 📍','사진 찍힘 📸'],
  hostId: 'user-001',
}
const MOCK_MEMBERS = [
  { id:'user-001', nickname:'불꽃감자',  emoji:'🔥', color:'#4A7C9E', lat:37.501, lng:127.031, status:'moving',  eta:8,  isHost:true  },
  { id:'user-002', nickname:'지각왕민수',emoji:'🐌', color:'#C9982A', lat:37.508, lng:127.025, status:'waiting', eta:18, isHost:false },
  { id:'user-003', nickname:'총알기차',  emoji:'⚡', color:'#6B9E6E', lat:37.499, lng:127.028, status:'arrived', eta:0,  isHost:false },
  { id:'user-004', nickname:'미지의인물',emoji:'👻', color:'#C27B5A', lat:37.512, lng:127.034, status:'moving',  eta:22, isHost:false },
]

export const useStore = create((set, get) => ({
  room: null,
  members: [],
  myId: null,
  myNickname: '',
  myEmoji: '🙂',
  isHost: false,
  phase: 'lobby',
  nudgeCooldowns: {},
  rouletteResult: null,
  rouletteTargets: [],

  // ── 데모 모드 ──
  loadDemoRoom: () => {
    set({
      room: MOCK_ROOM, members: MOCK_MEMBERS,
      myId: 'user-001', myNickname: '불꽃감자',
      isHost: true, phase: 'live',
    })
    // 위치 시뮬레이션
    const id = setInterval(() => {
      set(state => ({
        members: state.members.map(m => {
          if (m.status === 'arrived' || m.status === 'waiting') return m
          const newEta = Math.max(0, m.eta - Math.random() * 0.4)
          return {
            ...m,
            lat: m.lat + (Math.random()-0.5)*0.0005,
            lng: m.lng + (Math.random()-0.5)*0.0005,
            eta: newEta,
            status: newEta <= 1 ? 'arrived' : 'moving',
          }
        })
      }))
    }, 3000)
    // 컴포넌트 언마운트 시 정리는 페이지에서
    get()._demoIntervalId = id
  },

  // ── 방 생성 (Supabase 연동 후 roomService에서 호출) ──
  initRoom: (room, member, isHost) => {
    set({
      room,
      myId: member.id,
      myNickname: member.nickname,
      myEmoji: member.emoji,
      isHost,
      phase: 'live',
      members: [member],
    })
  },

  // ── 멤버 추가/업데이트 (Supabase 실시간) ──
  updateMembersFromDB: (updatedMembers) => {
    set(state => {
      const map = new Map(state.members.map(m => [m.id, m]))
      updatedMembers.forEach(m => map.set(m.id, { ...map.get(m.id), ...m }))
      return { members: Array.from(map.values()) }
    })
  },

  // ── 내 위치 로컬 업데이트 ──
  setMemberLocation: (id, lat, lng, eta, status) => {
    set(state => ({
      members: state.members.map(m =>
        m.id === id ? { ...m, lat, lng, eta, status } : m
      )
    }))
  },

  // ── 로컬 방 생성 (Supabase 없을 때) ──
  createRoom: (data) => {
    const roomId   = nanoid(8)
    const memberId = get().myId || `m-${nanoid(6)}`
    const room     = { id: roomId, ...data, hostId: memberId, phase: 'live' }
    set({ room, phase: 'live' })
    return roomId
  },

  // ── 프로필 설정 ──
  setProfile: (nickname, emoji) => {
    const myId  = `m-${nanoid(6)}`
    const color = MCM_COLORS[Math.floor(Math.random() * MCM_COLORS.length)]
    set(state => ({
      myId, myNickname: nickname, myEmoji: emoji,
      members: [...state.members, {
        id: myId, nickname, emoji, color,
        lat: null, lng: null, status: 'waiting', eta: null, isHost: false,
      }]
    }))
  },

  // ── 재촉하기 ──
  nudge: (targetId) => {
    const now  = Date.now()
    const last = get().nudgeCooldowns[targetId] || 0
    if (now - last < 30000) return { ok: false, remainSec: Math.ceil((30000-(now-last))/1000) }
    set(s => ({ nudgeCooldowns: { ...s.nudgeCooldowns, [targetId]: now } }))
    return { ok: true }
  },

  // ── 룰렛 ──
  startRoulette: () => {
    const latecomers = get().members.filter(m => m.status !== 'arrived')
    set({ phase: 'roulette', rouletteTargets: latecomers.length > 0 ? latecomers : get().members })
  },
  setRouletteResult: (member, penalty) => {
    set({ rouletteResult: { member, penalty }, phase: 'done' })
  },
}))
