import axios from 'axios';

// Real browser User-Agent to avoid bot blocking
const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Common headers to mimic real browser
const BROWSER_HEADERS = {
    'User-Agent': USER_AGENT,
    Accept: 'application/pdf,*/*',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
};

// Fetch PDF from URL with bot-blocking bypass
export async function fetchPDF(url: string): Promise<ArrayBuffer> {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000, // 30 seconds timeout
        headers: BROWSER_HEADERS,
        maxRedirects: 5,
    });

    return response.data;
}

// Extract text from PDF using pdfjs-dist
export async function extractTextFromPDF(pdfData: ArrayBuffer): Promise<string> {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    // Server-side PDF extraction setup
    // Do not set workerSrc in Node.js environment as it causes "File URL host must be 'localhost'" error on Vercel
    // Node.js environment will automatically use a fake worker.

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfData),
        useSystemFonts: true,
        // Options to stabilize Node.js execution
        disableFontFace: true,
        verbosity: 0,
    });

    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => {
                if ('str' in item) {
                    return item.str;
                }
                return '';
            })
            .join(' ');
        textParts.push(pageText);
    }

    return textParts.join('\n\n');
}

// Split text into chunks for embedding
export function splitIntoChunks(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    const chunks: string[] = [];

    // Clean up the text
    const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

    if (cleanedText.length <= chunkSize) {
        return [cleanedText];
    }

    let start = 0;
    while (start < cleanedText.length) {
        let end = start + chunkSize;

        // Try to find a natural break point (sentence end, paragraph)
        if (end < cleanedText.length) {
            const breakPoints = ['. ', '。', '\n', '、', ', '];
            for (const bp of breakPoints) {
                const lastBreak = cleanedText.lastIndexOf(bp, end);
                if (lastBreak > start + chunkSize / 2) {
                    end = lastBreak + bp.length;
                    break;
                }
            }
        }

        chunks.push(cleanedText.slice(start, end).trim());
        start = end - overlap;

        // Avoid infinite loop
        if (start >= cleanedText.length - overlap) {
            break;
        }
    }

    return chunks.filter((chunk) => chunk.length > 50);
}

// Main function to process PDF URL
export async function processPDFFromURL(
    url: string
): Promise<{ text: string; chunks: string[] }> {
    const pdfBuffer = await fetchPDF(url);
    const text = await extractTextFromPDF(pdfBuffer);
    const chunks = splitIntoChunks(text);
    return { text, chunks };
}
