import { NavLink, type NavLinkProps } from '@mantine/core';
import { createLink, type LinkComponent } from '@tanstack/react-router';
import { forwardRef } from 'react';

interface MantineNavLinkProps extends Omit<NavLinkProps, 'href'> {}

const MantineNavLinkComponent = forwardRef<
  HTMLAnchorElement,
  MantineNavLinkProps
>(function MantineNavLinkComponentInner(props, ref) {
  return <NavLink ref={ref} {...props} />;
});

const CreatedNavLinkComponent = createLink(MantineNavLinkComponent);

export const NavLinkStyled: LinkComponent<typeof MantineNavLinkComponent> = (
  props,
) => <CreatedNavLinkComponent preload="intent" {...props} />;
