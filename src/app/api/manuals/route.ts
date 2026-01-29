import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { Manual } from '@/types';

// GET - List all manuals
export async function GET() {
    try {
        if (!isSupabaseConfigured()) {
            // Return empty list instead of error for demo purpose
            return NextResponse.json({ manuals: [] });
        }

        const supabase = createServerSupabaseClient();

        const { data: manuals, error } = await supabase
            .from('manuals')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ manuals: manuals as Manual[] });
    } catch (error) {
        console.error('Get manuals error:', error);
        return NextResponse.json(
            { error: 'マニュアル一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a manual
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'IDは必須です' },
                { status: 400 }
            );
        }

        if (!isSupabaseConfigured()) {
            return NextResponse.json(
                { error: 'Supabaseが設定されていません' },
                { status: 500 }
            );
        }

        const supabase = createServerSupabaseClient();

        // Delete manual (chunks will be deleted automatically due to CASCADE)
        const { error } = await supabase
            .from('manuals')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete manual error:', error);
        return NextResponse.json(
            { error: 'マニュアルの削除に失敗しました' },
            { status: 500 }
        );
    }
}
