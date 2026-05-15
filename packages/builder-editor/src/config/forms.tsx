import type { ComponentConfig } from '@measured/puck';
import { coreBlockRegistry, type BuilderBlockRegistry } from '@nexpress/builder-core';
import { getDefinition, renderDefinition } from './utils';

type FormProps = {
  formSlug: string;
  submitLabel?: string;
  title?: string;
};

export type FormComponents = {
  'core.form': FormProps;
};

export function createFormConfig(registry: BuilderBlockRegistry = coreBlockRegistry): any {
  return {
    'core.form': {
      defaultProps: {
        formSlug: '',
        submitLabel: 'Submit',
        title: '',
        ...(getDefinition(registry, 'core.form').defaultProps ?? {}),
      },
      fields: {
        formSlug: {
          type: 'text',
        },
        submitLabel: {
          type: 'text',
        },
        title: {
          type: 'text',
        },
      },
      label: 'Form',
      render: ({ id, ...props }: { id: string } & FormProps) => (
        <>{renderDefinition(
          'core.form',
          id,
          {
            formSlug: props.formSlug,
            ...(props.submitLabel ? { submitLabel: props.submitLabel } : {}),
            ...(props.title ? { title: props.title } : {}),
          },
          null,
          registry,
        )}</>
      ),
    },
  };
}
