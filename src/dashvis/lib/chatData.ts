import { supabase } from './supabase'
import type { ChatMessage } from './aiGateway'

export interface WsChat {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface WsChatMessage extends ChatMessage {
  id: string
  chatId: string
  createdAt: string
}

export async function getChats(): Promise<WsChat[]> {
  if (!supabase) return []
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching chats:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    title: row.title || 'New Chat',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}

export async function getChatMessages(chatId: string): Promise<WsChatMessage[]> {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return (data || []).map(row => ({
    id: row.id,
    chatId: row.chat_id,
    role: row.role as 'user' | 'assistant',
    text: row.content,
    createdAt: row.created_at
  }))
}

export async function createChat(title: string): Promise<WsChat | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: user.id, title })
    .select()
    .single()

  if (error) {
    console.error('Error creating chat:', error)
    return null
  }

  return {
    id: data.id,
    title: data.title,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  if (!supabase) return
  
  const { error } = await supabase
    .from('chat_messages')
    .insert({ chat_id: chatId, role, content })

  if (error) {
    console.error('Error saving message:', error)
    return
  }

  // Update chat's updated_at
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
}

export async function deleteChat(chatId: string) {
  if (!supabase) return
  const { error } = await supabase.from('chats').delete().eq('id', chatId)
  if (error) console.error('Error deleting chat:', error)
}
