import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGetParliamentaryQuestions, getParliamentaryQuestionsToolMetadata } from './getParliamentaryQuestions.js';
import { epClient } from '../clients/europeanParliamentClient.js';

// Mock the EP client
vi.mock('../clients/europeanParliamentClient.js', () => ({
  epClient: {
    getParliamentaryQuestions: vi.fn(),
    getParliamentaryQuestionById: vi.fn()
  }
}));

describe('get_parliamentary_questions Tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept request with no filters', async () => {
      const mockQuestions = {
        data: [
          {
            id: 'Q-001',
            type: 'WRITTEN',
            author: 'MEP-124810',
            topic: 'Climate Policy',
            status: 'ANSWERED',
            questionText: 'What measures are being taken?',
            answerText: 'Response...',
            date: '2024-01-15',
            answerDate: '2024-02-10'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      const result = await handleGetParliamentaryQuestions({});

      expect(result.content[0].type).toBe('text');
      expect(epClient.getParliamentaryQuestions).toHaveBeenCalledWith({
        limit: 50,
        offset: 0
      });
    });

    it('should accept valid question type', async () => {
      const mockQuestions = {
        data: [
          {
            id: 'Q-001',
            type: 'WRITTEN',
            author: 'MEP-124810',
            topic: 'Climate Policy',
            status: 'ANSWERED',
            questionText: 'What measures?',
            date: '2024-01-15'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      const result = await handleGetParliamentaryQuestions({ type: 'WRITTEN' });

      expect(result.content[0].type).toBe('text');
      expect(epClient.getParliamentaryQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'WRITTEN' })
      );
    });

    it('should accept valid status', async () => {
      const mockQuestions = {
        data: [
          {
            id: 'Q-001',
            type: 'ORAL',
            author: 'MEP-124810',
            topic: 'Climate',
            status: 'PENDING',
            questionText: 'Question?',
            date: '2024-01-15'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      const result = await handleGetParliamentaryQuestions({ status: 'PENDING' });

      expect(result.content[0].type).toBe('text');
      expect(epClient.getParliamentaryQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING' })
      );
    });

    it('should accept valid date range', async () => {
      const mockQuestions = {
        data: [],
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      await handleGetParliamentaryQuestions({
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      });

      expect(epClient.getParliamentaryQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          dateFrom: '2024-01-01',
          dateTo: '2024-12-31'
        })
      );
    });

    it('should accept valid limit', async () => {
      const mockQuestions = {
        data: [],
        total: 0,
        limit: 25,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      await handleGetParliamentaryQuestions({ limit: 25 });

      expect(epClient.getParliamentaryQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 25 })
      );
    });

    it('should reject invalid question type', async () => {
      await expect(
        handleGetParliamentaryQuestions({ type: 'INVALID' as never })
      ).rejects.toThrow();
    });

    it('should reject invalid status', async () => {
      await expect(
        handleGetParliamentaryQuestions({ status: 'INVALID' as never })
      ).rejects.toThrow();
    });

    it('should reject invalid date format', async () => {
      await expect(
        handleGetParliamentaryQuestions({ dateFrom: 'invalid-date' })
      ).rejects.toThrow();
    });
  });

  describe('Response Format', () => {
    it('should return MCP-compliant response structure', async () => {
      const mockQuestions = {
        data: [
          {
            id: 'Q-001',
            type: 'WRITTEN',
            author: 'MEP-124810',
            topic: 'Climate',
            status: 'ANSWERED',
            questionText: 'Question?',
            date: '2024-01-15'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      const result = await handleGetParliamentaryQuestions({});

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON in text field', async () => {
      const mockQuestions = {
        data: [
          {
            id: 'Q-001',
            type: 'WRITTEN',
            author: 'MEP-124810',
            topic: 'Climate',
            status: 'ANSWERED',
            questionText: 'Question?',
            date: '2024-01-15'
          }
        ],
        total: 1,
        limit: 50,
        offset: 0,
        hasMore: false
      };
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);

      const result = await handleGetParliamentaryQuestions({});
      const parsed: unknown = JSON.parse(result.content[0].text);

      expect(typeof parsed === 'object' && parsed !== null).toBe(true);
      expect(parsed).toHaveProperty('data');
      expect(parsed).toHaveProperty('total');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      vi.mocked(epClient.getParliamentaryQuestions).mockRejectedValue(
        new Error('API Error')
      );

      await expect(handleGetParliamentaryQuestions({})).rejects.toThrow(
        'Failed to retrieve parliamentary questions'
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(epClient.getParliamentaryQuestions).mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(handleGetParliamentaryQuestions({})).rejects.toThrow(
        'Failed to retrieve parliamentary questions'
      );
    });
  });

  describe('Tool Metadata', () => {
    it('should have correct tool name', () => {
      expect(getParliamentaryQuestionsToolMetadata.name).toBe('get_parliamentary_questions');
    });

    it('should have description', () => {
      expect(getParliamentaryQuestionsToolMetadata.description).toBeTruthy();
      expect(getParliamentaryQuestionsToolMetadata.description.length).toBeGreaterThan(50);
    });

    it('should have input schema', () => {
      expect(getParliamentaryQuestionsToolMetadata.inputSchema).toBeDefined();
      expect(getParliamentaryQuestionsToolMetadata.inputSchema.type).toBe('object');
      expect(getParliamentaryQuestionsToolMetadata.inputSchema.properties).toBeDefined();
    });
  });

  describe('docId lookup branch', () => {
    it('should call getParliamentaryQuestionById when docId is provided', async () => {
      const mockQuestion = {
        id: 'E-001/2024',
        title: 'Question on AI',
        date: '2024-01-15',
        author: 'MEP-124810',
        type: 'E',
        answer: 'Answer text'
      };
      vi.mocked(epClient.getParliamentaryQuestionById).mockResolvedValue(mockQuestion);

      const result = await handleGetParliamentaryQuestions({ docId: 'E-001/2024' });
      expect(result.content[0].type).toBe('text');
      const parsed = JSON.parse(result.content[0].text) as { id: string };
      expect(parsed.id).toBe('E-001/2024');
    });
  });

  describe('Optional filter params branches', () => {
    const mockQuestions = {
      data: [{
        id: 'Q-001', type: 'WRITTEN', author: 'MEP-124810',
        topic: 'Climate Policy', status: 'ANSWERED',
        questionText: 'Question?', date: '2024-01-15'
      }],
      total: 1, limit: 50, offset: 0, hasMore: false
    };

    it('should pass author parameter to API', async () => {
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);
      await handleGetParliamentaryQuestions({ author: 'MEP-124810' });
      const callArgs = vi.mocked(epClient.getParliamentaryQuestions).mock.calls[0]?.[0];
      expect(callArgs).toMatchObject({ author: 'MEP-124810' });
    });

    it('should pass topic parameter to API', async () => {
      vi.mocked(epClient.getParliamentaryQuestions).mockResolvedValue(mockQuestions);
      await handleGetParliamentaryQuestions({ topic: 'Climate' });
      const callArgs = vi.mocked(epClient.getParliamentaryQuestions).mock.calls[0]?.[0];
      expect(callArgs).toMatchObject({ topic: 'Climate' });
    });

    it('should use "Unknown error" when thrown value is not an Error instance', async () => {
      vi.mocked(epClient.getParliamentaryQuestions).mockRejectedValueOnce({ code: 500 });
      await expect(handleGetParliamentaryQuestions({})).rejects.toThrow('Unknown error');
    });
  });
});
