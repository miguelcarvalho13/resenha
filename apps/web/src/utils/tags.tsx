import { type MantineColor } from '@mantine/core';

import { type Tag } from '@/models/tags';

export const TAG_COLOR = {
  date: 'red',
  number: 'blue',
  string: 'orange',
  boolean: 'green',
} satisfies { [key in Tag['type']]: MantineColor };
