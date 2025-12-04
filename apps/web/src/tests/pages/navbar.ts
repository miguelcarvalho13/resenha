import { page } from '@vitest/browser/context';

export const createNavbarPO = () => {
  const headerLocator = page.getByRole('banner');
  const navbar = page.getByRole('navigation');
  const navbarLinks = navbar.getByRole('link');

  const header = {
    it: headerLocator,

    hamburgerMenu: headerLocator.getByRole('button', {
      name: /Hamburger menu/,
    }),

    // methods
    avatarButton: (name: string | RegExp) =>
      headerLocator.getByRole('button', { name }),
    avatarMenu: (name: string | RegExp) => {
      const menu = page.getByRole('menu', { name });
      const menuItems = menu.getByRole('menuitem');

      return {
        it: menu,
        items: menuItems,
        logoutButton: menu.getByRole('menuitem', { name: /Logout/ }),
      };
    },
  };

  return {
    header,
    navbar,
    navbarLinks,
    navbarHomeLink: navbarLinks.filter({ hasText: /Recent/ }),
    navbarSearchesLink: navbarLinks.filter({ hasText: /Searches/ }),
    navbarTrashLink: navbarLinks.filter({ hasText: /Trash/ }),
  };
};
