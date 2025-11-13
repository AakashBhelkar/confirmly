import { theme, darkTheme } from '../theme';

export { theme, darkTheme };

export const getTheme = (mode: 'light' | 'dark' = 'light') => {
  return mode === 'dark' ? darkTheme : theme;
};

