import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import createPersistedState from 'use-persisted-state';

const useColorSchemeState = createPersistedState('colorScheme');

export function useColorScheme() {
  const prefersDarkMode = useMediaQuery({ query: '(prefers-color-scheme: dark)' });
  const [isDark, setIsDark] = useColorSchemeState(prefersDarkMode);

  useEffect(() => {
    const element = document.body;
    if (isDark) {
      element.classList.add('dark-mode');
      element.classList.remove('light-mode');
    } else {
      element.classList.add('light-mode');
      element.classList.remove('dark-mode');
    }
  }, [isDark]);

  return { isDark, setIsDark };
}
