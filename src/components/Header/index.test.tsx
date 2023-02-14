/**
 * @jest-environment jsdom
 */
import React, { SetStateAction, useState } from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Header from '.';
import { context } from '@/pages';
import { Disasters, Preferences } from '../LayerFilter/loader';

jest.mock('@/components/Map', () => {
  return function DummyPages(props) {
    return <div>page</div>;
  };
});

jest.mock('@/components/Tooltip/content', () => {
  return function DummyPages(props) {
    return <div>Tooltip</div>;
  };
});

describe('Rendering', () => {
  const _context: any = {};
  const mockSettings = {
    title: 'デジタル裾野',
    background_color: '#17a2b8',
  };
  _context.preferences = { settings: mockSettings };
  it('title in json', () => {
    const disasters: Disasters = {
      default: 1,
      data: [],
    };
    const [_preference, setPreferrence] = useState<Preferences | null>(null);
    const [_currentDisaster, setCurrentDisaster] = useState<string>('');
    const header = render(
      <context.Provider value={_context}>
        <Header
          disasters={disasters}
          isDisaster={true}
          setPreferrence={setPreferrence}
          setCurrentDisaster={setCurrentDisaster}
        />
      </context.Provider>
    );

    // jsonから取得したtitleが表示されている
    expect(header.getByText(mockSettings.title) instanceof HTMLElement).toBeTruthy();
  });
});
