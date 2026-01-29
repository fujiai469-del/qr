// Manual types
export interface Manual {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'web';
  created_at: string;
  chunk_count: number;
}

export interface ManualChunk {
  id: string;
  manual_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ManualSource[];
  timestamp: Date;
}

export interface ManualSource {
  manual_id: string;
  manual_title: string;
  chunk_content: string;
  similarity: number;
}

// API types
export interface IngestRequest {
  url: string;
  title?: string;
}

export interface IngestResponse {
  success: boolean;
  manual?: Manual;
  error?: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  sources: ManualSource[];
}

// QR Scanner types
export interface QRScanResult {
  text: string;
  format: string;
}
