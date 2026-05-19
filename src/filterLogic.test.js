import { expect, test } from 'vitest';
import { FILTER_CONFIG, filterAnimes, createInitialState } from './filterLogic.js';

test('Initial state is correct', () => {
  const state = createInitialState();
  expect(state.attributes.has('全部')).toBe(true);
  expect(state.type).toBe('全部');
  expect(state.audience).toBe('全部');
});

test('Filters animes correctly with AND logic across boundaries', () => {
  const animes = [
    { title: 'A', tags: ['動作', '奇幻', 'OVA', '闔家觀賞'] },
    { title: 'B', tags: ['動作', '電影', '年齡限制'] }
  ];
  
  const state = {
    attributes: new Set(['動作']),
    type: 'OVA',
    audience: '闔家觀賞'
  };
  
  const result = filterAnimes(animes, state);
  expect(result.length).toBe(1);
  expect(result[0].title).toBe('A');
});

test('Filters correctly when attributes use multi-select (strict AND)', () => {
  const animes = [
    { title: 'A', tags: ['動作', '奇幻', 'OVA', '闔家觀賞'] },
    { title: 'B', tags: ['動作', 'OVA', '闔家觀賞'] }
  ];
  
  const state = {
    attributes: new Set(['動作', '奇幻']),
    type: 'OVA',
    audience: '闔家觀賞'
  };
  
  const result = filterAnimes(animes, state);
  expect(result.length).toBe(1);
  expect(result[0].title).toBe('A');
});
