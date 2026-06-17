/**
 * roomService.js
 * Supabase 연동된 방 생성/참가/실시간 구독 로직
 * Supabase 미연동 시 자동으로 로컬 모드로 폴백
 *
 * Supabase 테이블 DDL (대시보드 SQL Editor에서 실행):
 * -------------------------------------------------------
 * create table rooms (
 *   id text primary key,
 *   title text not null,
 *   destination_name text,
 *   destination_lat float8,
 *   destination_lng float8,
 *   meeting_time bigint,
 *   penalties text[],
 *   host_id text,
 *   phase text default 'live',
 *   created_at timestamptz default now()
 * );
 *
 * create table members (
 *   id text primary key,
 *   room_id text references rooms(id) on delete cascade,
 *   nickname text,
 *   emoji text,
 *   color text,
 *   lat float8,
 *   lng float8,
 *   status text default 'waiting',
 *   eta float8,
 *   is_host boolean default false,
 *   updated_at timestamptz default now()
 * );
 *
 * -- 실시간 활성화
 * alter publication supabase_realtime add table members;
 * alter publication supabase_realtime add table rooms;
 *
 * -- RLS 비활성화 (MVP용, 프로덕션에서는 정책 설정 필요)
 * alter table rooms disable row level security;
 * alter table members disable row level security;
 * -------------------------------------------------------
 */

import { supabase } from './supabase'
import { nanoid } from 'nanoid'

const MCM_COLORS = ['#4A7C9E','#C9982A','#6B9E6E','#C27B5A','#7B7EC9','#9E6B6B','#6B9E9C']

// 방 생성
export async function createRoom(data, hostProfile) {
  const roomId = nanoid(8)
  const memberId = `m-${nanoid(8)}`
  const color = MCM_COLORS[0]

  if (!supabase) {
    // 로컬 모드
    return {
      roomId,
      memberId,
      room: { id: roomId, ...data, hostId: memberId, phase: 'live' },
      member: { id: memberId, roomId, ...hostProfile, color, status: 'waiting', eta: null, isHost: true },
    }
  }

  // Supabase에 방 저장
  const { error: roomErr } = await supabase.from('rooms').insert({
    id: roomId,
    title: data.title,
    destination_name: data.destination.name,
    destination_lat: data.destination.lat,
    destination_lng: data.destination.lng,
    meeting_time: data.meetingTime,
    penalties: data.penalties,
    host_id: memberId,
    phase: 'live',
  })
  if (roomErr) throw roomErr

  // 방장 멤버 등록
  const { error: memErr } = await supabase.from('members').insert({
    id: memberId,
    room_id: roomId,
    nickname: hostProfile.nickname,
    emoji: hostProfile.emoji,
    color,
    lat: null,
    lng: null,
    status: 'waiting',
    eta: null,
    is_host: true,
  })
  if (memErr) throw memErr

  return { roomId, memberId }
}

// 방 참가
export async function joinRoom(roomId, profile) {
  const memberId = `m-${nanoid(8)}`
  const color = MCM_COLORS[Math.floor(Math.random() * MCM_COLORS.length)]

  if (!supabase) return { memberId }

  // 방 정보 조회
  const { data: room, error: roomErr } = await supabase
    .from('rooms').select('*').eq('id', roomId).single()
  if (roomErr) throw new Error('방을 찾을 수 없습니다.')

  // 멤버 등록
  const { error: memErr } = await supabase.from('members').insert({
    id: memberId,
    room_id: roomId,
    nickname: profile.nickname,
    emoji: profile.emoji,
    color,
    lat: null,
    lng: null,
    status: 'waiting',
    eta: null,
    is_host: false,
  })
  if (memErr) throw memErr

  return { memberId, room }
}

// 방 정보 조회
export async function fetchRoom(roomId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('rooms').select('*').eq('id', roomId).single()
  if (error) return null

  return {
    id: data.id,
    title: data.title,
    destination: { name: data.destination_name, lat: data.destination_lat, lng: data.destination_lng },
    meetingTime: data.meeting_time,
    penalties: data.penalties || [],
    hostId: data.host_id,
    phase: data.phase,
  }
}

// 멤버 목록 조회
export async function fetchMembers(roomId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('members').select('*').eq('room_id', roomId)
  if (error) return []
  return data.map(normalizeMember)
}

// 내 위치 업데이트
export async function updateLocation(memberId, lat, lng, eta, status) {
  if (!supabase) return
  await supabase.from('members').update({
    lat, lng, eta, status, updated_at: new Date().toISOString()
  }).eq('id', memberId)
}

// 실시간 멤버 구독
export function subscribeMembersRealtime(roomId, onUpdate) {
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`room-${roomId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'members',
      filter: `room_id=eq.${roomId}`,
    }, payload => {
      onUpdate(normalizeMember(payload.new))
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// 룰렛 결과 저장
export async function saveRouletteResult(roomId, winnerId, penalty) {
  if (!supabase) return
  await supabase.from('rooms').update({ phase: 'done' }).eq('id', roomId)
}

// DB 컬럼 → 앱 형식 변환
function normalizeMember(m) {
  return {
    id: m.id,
    roomId: m.room_id,
    nickname: m.nickname,
    emoji: m.emoji,
    color: m.color,
    lat: m.lat,
    lng: m.lng,
    status: m.status || 'waiting',
    eta: m.eta,
    isHost: m.is_host,
  }
}
