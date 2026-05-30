export interface Message {
    role: 'user' | 'ai' | 'error';
    text: string;
}

export interface Chat {
    id: string;
    title: string;
    updated_at: string;
}