import { createConfirmation } from 'react-confirm';
import Dialog from './confirmable';

// create confirm function
export const confirm = createConfirmation(Dialog);

// This is optional. But wrapping function makes it easy to use.
export function confirmWrapper(confirmation, options = {}) {
  return confirm({ confirmation, options });
}