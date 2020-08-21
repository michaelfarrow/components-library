export type ComponentField = {
  label: string;
  value: string;
};

type Component = {
  id: string;
  slug: string;
  name?: string;
  description?: string;
  fieldDescription: string[];
  quantity: number;
  labelSize: number;
  datasheet?: string;
  datasheetPreview?: string;
  qr?: string;
  fields: ComponentField[];
};

export default Component;
