import axios from 'axios';
import * as cheerio from 'cheerio';

// Real browser User-Agent
const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Common headers to mimic real browser
const BROWSER_HEADERS = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
};

// Fetch web page HTML
export async function fetchWebPage(url: string): Promise<string> {
    const response = await axios.get(url, {
        timeout: 30000,
        headers: BROWSER_HEADERS,
        maxRedirects: 5,
    });
    return response.data;
}

// Extract main content text from HTML
export function extractTextFromHTML(html: string): string {
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .navigation, .sidebar, .menu, .ad, .advertisement').remove();

    // Try to find main content
    let mainContent = '';

    const contentSelectors = [
        'main',
        'article',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.post-content',
        '.entry-content',
    ];

    for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
            mainContent = element.text();
            break;
        }
    }

    // Fallback to body if no main content found
    if (!mainContent) {
        mainContent = $('body').text();
    }

    // Clean up whitespace
    return mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
}

// Extract title from HTML
export function extractTitleFromHTML(html: string): string {
    const $ = cheerio.load(html);

    // Try different title sources
    const title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="title"]').attr('content') ||
        $('title').text() ||
        $('h1').first().text() ||
        'Untitled';

    return title.trim();
}

// Split text into chunks
export function splitIntoChunks(
    text: string,
    chunkSize: number = 1000,
    overlap: number = 200
): string[] {
    const chunks: string[] = [];

    if (text.length <= chunkSize) {
        return [text];
    }

    let start = 0;
    while (start < text.length) {
        let end = start + chunkSize;

        if (end < text.length) {
            const breakPoints = ['. ', '。', '\n', '、', ', '];
            for (const bp of breakPoints) {
                const lastBreak = text.lastIndexOf(bp, end);
                if (lastBreak > start + chunkSize / 2) {
                    end = lastBreak + bp.length;
                    break;
                }
            }
        }

        chunks.push(text.slice(start, end).trim());
        start = end - overlap;

        if (start >= text.length - overlap) {
            break;
        }
    }

    return chunks.filter((chunk) => chunk.length > 50);
}

// Main function to process web page
export async function processWebPage(
    url: string
): Promise<{ title: string; text: string; chunks: string[] }> {
    const html = await fetchWebPage(url);
    const title = extractTitleFromHTML(html);
    const text = extractTextFromHTML(html);
    const chunks = splitIntoChunks(text);
    return { title, text, chunks };
}
