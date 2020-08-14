export type ComponentField = {
  label: string;
  value: string;
};

type Component = {
  id: string;
  slug: string;
  quantity: number;
  datasheet?: string;
  datasheetPreview?: string;
  qr?: string;
  fields: ComponentField[];
};

export default Component;
