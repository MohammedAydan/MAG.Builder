import { createBlockRegistry } from '../registry';
import { commerceDefinitions } from './commerce-blocks';
import { contentDefinitions } from './content-blocks';
import { formDefinitions } from './form-blocks';
import { layoutDefinitions } from './layout-blocks';

export const coreBlockRegistry = createBlockRegistry([
  ...contentDefinitions,
  ...layoutDefinitions,
  ...formDefinitions,
  ...commerceDefinitions,
]);
