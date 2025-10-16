import nock from 'nock';
import { describe, it, expect } from 'vitest';

describe('Upload API (mock)', () => {
  it('faz upload para endpoint mockado', async () => {
    const scope = nock('https://api.sittax.com.br')
      .post('/upload-nota')
      .reply(200, { ok: true });
    
    // Simulando uma chamada HTTP real para o endpoint mockado
    const response = await fetch('https://api.sittax.com.br/upload-nota', {
      method: 'POST',
      body: JSON.stringify({ nota: 'test' }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(response.status).toBe(200);
    expect(scope.isDone()).toBeTruthy();
  });
});