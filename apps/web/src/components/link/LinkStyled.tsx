import { Anchor, type AnchorProps } from '@mantine/core';
import { createLink, type LinkComponent } from '@tanstack/react-router';
import { forwardRef } from 'react';

interface MantineAnchorProps extends Omit<AnchorProps, 'href'> {}

const MantineLinkComponent = forwardRef<HTMLAnchorElement, MantineAnchorProps>(
  function MantineLinkComponentInner(props, ref) {
    return <Anchor ref={ref} {...props} />;
  },
);

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const LinkStyled: LinkComponent<typeof MantineLinkComponent> = (
  props,
) => <CreatedLinkComponent preload="intent" {...props} />;
