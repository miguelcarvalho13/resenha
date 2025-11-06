import 'i18next';
import { type resources } from './resources';

declare module 'i18next' {
  interface CustomTypeOptions {
    enableSelector: true;
    defaultNS: 'translation';
    resources: typeof resources;
  }
}
