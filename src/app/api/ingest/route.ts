import { NextRequest, NextResponse } from 'next/server';
import { processPDFFromURL } from '@/lib/pdf-extractor';
import { processWebPage } from '@/lib/web-scraper';
import { generateEmbedding, isOpenAIConfigured } from '@/lib/openai';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { Manual } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const { url, title } = await request.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URLは必須です' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: '無効なURLです' },
                { status: 400 }
            );
        }

        // Check configuration
        if (!isSupabaseConfigured()) {
            // Demo mode
            return NextResponse.json({
                success: true,
                manual: {
                    id: 'demo-manual-id',
                    title: title || 'デモマニュアル',
                    url: url,
                    type: url.toLowerCase().endsWith('.pdf') ? 'pdf' : 'web',
                    created_at: new Date().toISOString(),
                    chunk_count: 10,
                },
                message: 'デモモード: マニュアルを取り込みました（保存はされません）',
            });
        }

        if (!isOpenAIConfigured()) {
            return NextResponse.json(
                { success: false, error: 'OpenAI APIが設定されていません' },
                { status: 500 }
            );
        }

        const supabase = createServerSupabaseClient();
        const isPDF = url.toLowerCase().endsWith('.pdf');

        let chunks: string[];
        let extractedTitle: string;

        // Extract content based on type
        if (isPDF) {
            console.log('Processing PDF:', url);
            const result = await processPDFFromURL(url);
            chunks = result.chunks;
            extractedTitle = title || `PDF: ${new URL(url).pathname.split('/').pop() || 'Unknown'}`;
        } else {
            console.log('Processing Web Page:', url);
            const result = await processWebPage(url);
            chunks = result.chunks;
            extractedTitle = title || result.title;
        }

        if (chunks.length === 0) {
            return NextResponse.json(
                { success: false, error: 'コンテンツを抽出できませんでした' },
                { status: 400 }
            );
        }

        // Check if manual already exists
        const { data: existingManual } = await supabase
            .from('manuals')
            .select('id')
            .eq('url', url)
            .single();

        if (existingManual) {
            // Delete existing chunks
            await supabase
                .from('manual_chunks')
                .delete()
                .eq('manual_id', existingManual.id);

            // Update manual
            const { data: updatedManual, error: updateError } = await supabase
                .from('manuals')
                .update({
                    title: extractedTitle,
                    chunk_count: chunks.length,
                })
                .eq('id', existingManual.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Generate embeddings and insert chunks
            await insertChunks(supabase, existingManual.id, chunks);

            return NextResponse.json({
                success: true,
                manual: updatedManual as Manual,
                message: 'マニュアルを更新しました',
            });
        }

        // Insert new manual
        const { data: newManual, error: insertError } = await supabase
            .from('manuals')
            .insert({
                title: extractedTitle,
                url,
                type: isPDF ? 'pdf' : 'web',
                chunk_count: chunks.length,
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // Generate embeddings and insert chunks
        await insertChunks(supabase, newManual.id, chunks);

        return NextResponse.json({
            success: true,
            manual: newManual as Manual,
            message: 'マニュアルを取り込みました',
        });
    } catch (error) {
        console.error('Ingest error:', error);
        const errorMessage = error instanceof Error ? error.message : '取り込みに失敗しました';
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertChunks(supabase: any, manualId: string, chunks: string[]) {
    // Process chunks in batches to avoid timeout
    const batchSize = 5;

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const chunkData = await Promise.all(
            batch.map(async (content, idx) => {
                const embedding = await generateEmbedding(content);
                return {
                    manual_id: manualId,
                    content,
                    embedding,
                    chunk_index: i + idx,
                };
            })
        );

        const { error } = await supabase.from('manual_chunks').insert(chunkData);
        if (error) throw error;
    }
}
