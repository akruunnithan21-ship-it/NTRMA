import axios from 'axios';

/**
 * AI Bridge Service
 * Communicates with the Python AI Engine (FastAPI)
 */

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

export class AIBridgeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_ENGINE_URL;
  }

  async getSignal(symbol: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/signals/generate`, {
        symbol,
        strategy: 'aggressive',
      });
      return response.data;
    } catch (error) {
      console.error('AI Engine unreachable:', error);
      return null;
    }
  }

  async analyzeStock(symbol: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/analysis/${symbol}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getSentiment(query: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/sentiment/analyze`, { query });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async askOllama(question: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/ask`, { question });
      return response.data;
    } catch (error) {
      return { answer: 'AI Engine not available', error: true };
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, { timeout: 3000 });
      return response.data;
    } catch (error) {
      return { status: 'disconnected' };
    }
  }
}

export const aiBridge = new AIBridgeService();
