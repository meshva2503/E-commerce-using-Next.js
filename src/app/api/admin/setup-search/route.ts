import { NextResponse } from 'next/server';
import { createTextIndex } from '@/lib/bm25SearchService';

export async function POST() {
    try {
        await createTextIndex();
        return NextResponse.json({ message: 'Text index created successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
