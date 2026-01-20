import '../src/styles/globals.css'; // ajuste se necessário

import { ThemeProvider } from 'next-themes';

const preview = {
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
