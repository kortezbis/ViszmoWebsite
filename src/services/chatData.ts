import { supabase } from '../lib/supabase';
import type { ChatMessage } from './aiGateway';

export interface WsChat {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface WsChatMessage extends ChatMessage {
    id: string;
    chatId: string;
    createdAt: string;
}

export async function getChats(): Promise<WsChat[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching chats:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        title: row.title || 'New Chat',
        createdAt: row.created_at,
        updatedAt: row.updated_at
    }));
}

export async function getChatMessages(chatId: string): Promise<WsChatMessage[]> {
    const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return (data || []).map(row => ({
        id: row.id,
        chatId: row.chat_id,
        role: row.role as 'user' | 'assistant',
        text: row.content,
        createdAt: row.created_at
    }));
}

export async function createChat(title: string): Promise<WsChat | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('chats')
        .insert({ user_id: user.id, title })
        .select()
        .single();

    if (error) {
        console.error('Error creating chat:', error);
        return null;
    }

    return {
        id: data.id,
        title: data.title,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}

export async function saveMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<WsChatMessage | null> {
    const { data, error } = await supabase
        .from('chat_messages')
        .insert({ chat_id: chatId, role, content })
        .select()
        .single();

    if (error) {
        console.error('Error saving message:', error);
        return null;
    }

    // Update chat's updated_at
    await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

    return {
        id: data.id,
        chatId: data.chat_id,
        role: data.role as 'user' | 'assistant',
        text: data.content,
        createdAt: data.created_at,
    };
}

export async function deleteChat(chatId: string) {
    const { error } = await supabase.from('chats').delete().eq('id', chatId);
    if (error) console.error('Error deleting chat:', error);
}

type ChatMessageRow = {
    id: string;
    chat_id: string;
    profile_id: string;
    role: string;
    content: string;
    created_at: string;
};

type ChatRow = {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

function mapChatMessageRow(row: ChatMessageRow): WsChatMessage {
    return {
        id: row.id,
        chatId: row.chat_id,
        role: row.role as 'user' | 'assistant',
        text: row.content,
        createdAt: row.created_at,
    };
}

function mapChatRow(row: ChatRow): WsChat {
    return {
        id: row.id,
        title: row.title || 'New Chat',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function subscribeToChatMessages(
    chatId: string,
    onInsert: (message: WsChatMessage) => void,
) {
    const channel = supabase
        .channel(`chat-messages:${chatId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `chat_id=eq.${chatId}`,
            },
            (payload) => {
                onInsert(mapChatMessageRow(payload.new as ChatMessageRow));
            },
        )
        .subscribe();

    return () => {
        void supabase.removeChannel(channel);
    };
}

export function subscribeToChats(onChange: () => void) {
    const channel = supabase
        .channel('chat-sessions')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'chats' },
            () => onChange(),
        )
        .subscribe();

    return () => {
        void supabase.removeChannel(channel);
    };
}
