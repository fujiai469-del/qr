import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateChatResponse, isOpenAIConfigured } from '@/lib/openai';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { ManualSource } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { message, history = [] } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'メッセージは必須です' },
                { status: 400 }
            );
        }

        // Check configuration
        if (!isSupabaseConfigured() || !isOpenAIConfigured()) {
            // Demo response
            return NextResponse.json({
                message: 'デモモード: SupabaseまたはOpenAI APIが設定されていません。\n\n正式に利用するには環境変数の設定が必要です。\n\nこれはダミーの自動応答メッセージです。',
                sources: [
                    {
                        manual_id: 'demo',
                        manual_title: 'デモマニュアル',
                        chunk_content: 'これはデモ用のダミーコンテンツです。',
                        similarity: 1.0
                    }
                ]
            });
        }

        if (!isOpenAIConfigured()) {
            return NextResponse.json(
                { error: 'OpenAI APIが設定されていません' },
                { status: 500 }
            );
        }

        const supabase = createServerSupabaseClient();

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(message);

        // Search for relevant chunks using vector similarity
        const { data: matchedChunks, error: searchError } = await supabase.rpc(
            'match_chunks',
            {
                query_embedding: queryEmbedding,
                match_count: 5,
            }
        );

        if (searchError) {
            console.error('Search error:', searchError);
            throw searchError;
        }

        // Get manual titles for sources
        const manualIds = [...new Set(matchedChunks?.map((c: { manual_id: string }) => c.manual_id) || [])];

        const { data: manuals } = await supabase
            .from('manuals')
            .select('id, title')
            .in('id', manualIds);

        const manualTitleMap = new Map(
            manuals?.map((m: { id: string; title: string }) => [m.id, m.title]) || []
        );

        // Build context from matched chunks
        const context = matchedChunks
            ?.map((chunk: { content: string }) => chunk.content)
            .join('\n\n---\n\n') || '';

        // Build sources
        const sources: ManualSource[] = matchedChunks?.map((chunk: {
            manual_id: string;
            content: string;
            similarity: number
        }) => ({
            manual_id: chunk.manual_id,
            manual_title: manualTitleMap.get(chunk.manual_id) || 'Unknown',
            chunk_content: chunk.content.substring(0, 200) + '...',
            similarity: chunk.similarity,
        })) || [];

        // Generate response using GPT-4o
        const chatHistory = history.map((msg: { role: string; content: string }) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        }));

        const response = await generateChatResponse(message, context, chatHistory);

        return NextResponse.json({
            message: response,
            sources: sources.slice(0, 3), // Return top 3 sources
        });
    } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'チャットエラーが発生しました';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
