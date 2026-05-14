export type EditorComponentData = Readonly<{
  props: Readonly<{
    [key: string]: unknown;
    content?: readonly EditorComponentData[];
    id: string;
  }>;
  type: string;
}>;

export type EditorData = Readonly<{
  content: readonly EditorComponentData[];
  root: Readonly<Record<string, unknown>>;
}>;

export type EditorConversionResult = Readonly<{
  data: EditorData;
  warnings: readonly string[];
}>;
