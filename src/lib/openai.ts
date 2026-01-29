import OpenAI from 'openai';

// Initialize OpenAI client
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

// Generate chat completion with RAG context
export async function generateChatResponse(
    query: string,
    context: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
    const systemPrompt = `あなたは製品マニュアルに関する質問に答えるアシスタントです。
以下のコンテキスト情報を参考にして、ユーザーの質問に正確かつ丁寧に回答してください。

コンテキスト:
${context}

回答のガイドライン:
- コンテキストに基づいて回答してください
- コンテキストに情報がない場合は、その旨を伝えてください
- 技術的な内容は分かりやすく説明してください
- 必要に応じて箇条書きを使ってください`;

    const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...history.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        })),
        { role: 'user', content: query },
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || '回答を生成できませんでした。';
}

// Check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
}
