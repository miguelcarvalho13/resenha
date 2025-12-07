import { SimpleGrid, type SimpleGridProps } from '@mantine/core';

interface CommonGridProps extends SimpleGridProps {}

export const CommonGrid = ({ children, ...props }: CommonGridProps) => (
  <SimpleGrid
    cols={{ base: 1, sm: 2, lg: 4 }}
    spacing={{ base: 10, sm: 'xl' }}
    verticalSpacing={{ base: 'md', sm: 'xl' }}
    {...props}
  >
    {children}
  </SimpleGrid>
);
