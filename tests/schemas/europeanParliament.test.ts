/**
 * Tests for European Parliament schema validation utilities and constants
 * 
 * Ensures that exported validation helpers and reference data work correctly
 * before exposing them through the public API.
 * 
 * ISMS Policy: SC-002 (Secure Coding Standards - Input Validation Testing)
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  safeValidate,
  formatValidationErrors,
  EU_MEMBER_STATES,
  EU_LANGUAGES,
  EP_PARTY_GROUPS,
  MEPSchema,
  GetMEPsSchema
} from '../../src/schemas/europeanParliament.js';

describe('safeValidate', () => {
  const TestSchema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive()
  });

  it('should return success:true with valid data', () => {
    const result = safeValidate(TestSchema, { name: 'John', age: 30 });
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'John', age: 30 });
    }
  });

  it('should return success:false with invalid data', () => {
    const result = safeValidate(TestSchema, { name: '', age: -5 });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toBeInstanceOf(z.ZodError);
      expect(result.errors.issues.length).toBeGreaterThan(0);
    }
  });

  it('should handle missing required fields', () => {
    const result = safeValidate(TestSchema, { name: 'John' });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['age'],
            code: 'invalid_type'
          })
        ])
      );
    }
  });

  it('should handle wrong types', () => {
    const result = safeValidate(TestSchema, { name: 'John', age: 'thirty' });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.issues[0]).toMatchObject({
        path: ['age'],
        code: 'invalid_type',
        expected: 'number'
      });
    }
  });

  it('should work with complex schemas like MEPSchema', () => {
    const validMEP = {
      id: 'mep-123',
      name: 'Jane Doe',
      country: 'SE',
      politicalGroup: 'S&D',
      committees: [],
      active: true,
      termStart: '2019-07-02'
    };

    const result = safeValidate(MEPSchema, validMEP);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('mep-123');
      expect(result.data.name).toBe('Jane Doe');
      expect(result.data.termStart).toBe('2019-07-02');
    }
  });

  it('should preserve type safety with discriminated union', () => {
    const result = safeValidate(TestSchema, { name: 'John', age: 30 });
    
    // TypeScript should narrow the type based on success field
    if (result.success) {
      // Should have data property
      expect(result.data).toBeDefined();
      // @ts-expect-error - errors should not exist when success is true
      expect(result.errors).toBeUndefined();
    } else {
      // Should have errors property
      expect(result.errors).toBeDefined();
      // @ts-expect-error - data should not exist when success is false
      expect(result.data).toBeUndefined();
    }
  });
});

describe('formatValidationErrors', () => {
  const TestSchema = z.object({
    user: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email format"),
      age: z.number().int().positive("Age must be positive")
    }),
    tags: z.array(z.string())
  });

  it('should format single field error', () => {
    const result = TestSchema.safeParse({
      user: { name: '', email: 'valid@example.com', age: 25 },
      tags: []
    });

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('user.name: Name is required');
    }
  });

  it('should format multiple field errors', () => {
    const result = TestSchema.safeParse({
      user: { name: '', email: 'invalid-email', age: -5 },
      tags: []
    });

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors).toHaveLength(3);
      expect(errors).toContain('user.name: Name is required');
      expect(errors).toContain('user.email: Invalid email format');
      expect(errors).toContain('user.age: Age must be positive');
    }
  });

  it('should format nested path errors correctly', () => {
    const result = TestSchema.safeParse({
      user: { name: 'John', email: 'test@example.com', age: 30 },
      tags: [123] // Invalid: should be strings
    });

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toMatch(/^tags\.\d+:/);
    }
  });

  it('should handle root-level errors without path', () => {
    const StringSchema = z.string().min(5);
    const result = StringSchema.safeParse('abc');

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors).toHaveLength(1);
      // Root level errors have empty path, so formatValidationErrors shows just the message
      expect(errors[0]).toBeTruthy();
      expect(errors[0].length).toBeGreaterThan(0);
    }
  });

  it('should format array index errors', () => {
    const result = z.array(z.number()).safeParse([1, 2, 'three', 4]);

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/^2:/); // Index 2
      expect(errors[0]).toContain('number');
    }
  });

  it('should handle complex GetMEPsSchema validation errors', () => {
    const result = GetMEPsSchema.safeParse({
      country: 'INVALID', // Should be 2 characters
      limit: -10, // Should be positive
      offset: 'invalid' // Should be number
    });

    if (!result.success) {
      const errors = formatValidationErrors(result.error);
      
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('country:'),
          expect.stringContaining('limit:'),
          expect.stringContaining('offset:')
        ])
      );
    }
  });
});

describe('EU_MEMBER_STATES', () => {
  it('should be a Set', () => {
    expect(EU_MEMBER_STATES).toBeInstanceOf(Set);
  });

  it('should contain exactly 27 member states', () => {
    expect(EU_MEMBER_STATES.size).toBe(27);
  });

  it('should contain all expected EU countries (sample check)', () => {
    const expectedMembers = ['AT', 'BE', 'DE', 'FR', 'IT', 'SE', 'ES', 'PL', 'NL'];
    
    for (const country of expectedMembers) {
      expect(EU_MEMBER_STATES.has(country)).toBe(true);
    }
  });

  it('should not contain non-EU countries', () => {
    const nonEUCountries = ['GB', 'CH', 'NO', 'US', 'RU'];
    
    for (const country of nonEUCountries) {
      expect(EU_MEMBER_STATES.has(country)).toBe(false);
    }
  });

  it('should be case-sensitive (uppercase only)', () => {
    expect(EU_MEMBER_STATES.has('DE')).toBe(true);
    expect(EU_MEMBER_STATES.has('de')).toBe(false);
  });

  it('should contain ISO 3166-1 alpha-2 codes', () => {
    // All codes should be exactly 2 characters
    for (const code of EU_MEMBER_STATES) {
      expect(code).toHaveLength(2);
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('EU_LANGUAGES', () => {
  it('should be a Set', () => {
    expect(EU_LANGUAGES).toBeInstanceOf(Set);
  });

  it('should contain exactly 24 official languages', () => {
    expect(EU_LANGUAGES.size).toBe(24);
  });

  it('should contain all expected EU languages (sample check)', () => {
    const expectedLanguages = ['en', 'de', 'fr', 'es', 'it', 'sv', 'pl', 'nl'];
    
    for (const lang of expectedLanguages) {
      expect(EU_LANGUAGES.has(lang)).toBe(true);
    }
  });

  it('should not contain non-EU languages', () => {
    const nonEULanguages = ['zh', 'ja', 'ru', 'ar'];
    
    for (const lang of nonEULanguages) {
      expect(EU_LANGUAGES.has(lang)).toBe(false);
    }
  });

  it('should be case-sensitive (lowercase only)', () => {
    expect(EU_LANGUAGES.has('en')).toBe(true);
    expect(EU_LANGUAGES.has('EN')).toBe(false);
  });

  it('should contain ISO 639-1 codes', () => {
    // All codes should be exactly 2 characters
    for (const code of EU_LANGUAGES) {
      expect(code).toHaveLength(2);
      expect(code).toMatch(/^[a-z]{2}$/);
    }
  });
});

describe('EP_PARTY_GROUPS', () => {
  it('should be a Set', () => {
    expect(EP_PARTY_GROUPS).toBeInstanceOf(Set);
  });

  it('should contain exactly 8 political groups', () => {
    expect(EP_PARTY_GROUPS.size).toBe(8);
  });

  it('should contain all expected party groups', () => {
    const expectedGroups = [
      'PPE',          // European People's Party
      'S&D',          // Progressive Alliance of Socialists and Democrats
      'Renew',        // Renew Europe
      'Greens/EFA',   // Greens/European Free Alliance
      'ECR',          // European Conservatives and Reformists
      'ID',           // Identity and Democracy
      'The Left',     // The Left
      'NI'            // Non-Inscrits (Non-attached)
    ];
    
    for (const group of expectedGroups) {
      expect(EP_PARTY_GROUPS.has(group)).toBe(true);
    }
  });

  it('should not contain non-existent groups', () => {
    const invalidGroups = ['ALDE', 'GUE/NGL', 'INVALID'];
    
    for (const group of invalidGroups) {
      expect(EP_PARTY_GROUPS.has(group)).toBe(false);
    }
  });

  it('should be case-sensitive', () => {
    expect(EP_PARTY_GROUPS.has('PPE')).toBe(true);
    expect(EP_PARTY_GROUPS.has('ppe')).toBe(false);
  });

  it('should handle groups with special characters', () => {
    expect(EP_PARTY_GROUPS.has('S&D')).toBe(true);
    expect(EP_PARTY_GROUPS.has('Greens/EFA')).toBe(true);
    expect(EP_PARTY_GROUPS.has('The Left')).toBe(true);
  });
});
