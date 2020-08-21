import React from 'react';
import Category from ':types/Category';
import Component from ':types/Component';
import ComponentGroup from ':types/ComponentGroup';
import Link from 'next/link';

export type Label = {
  qr?: string;
  id: string;
  name: string;
  colour?: string;
  size: number;
  description?: string | string[];
};

export type LabelsContextType = {
  labels: Label[];
  getLabel: (id: string) => Label | undefined;
  addLabel: (label: Label) => boolean;
  removeLabel: (id: string) => boolean;
  clear: () => boolean;
};

export const LabelsContext = React.createContext<LabelsContextType>({
  labels: [],
  getLabel: () => {
    return undefined;
  },
  addLabel: () => {
    return false;
  },
  removeLabel: () => {
    return false;
  },
  clear: () => {
    return false;
  },
});

type LabelsProviderProps = {
  children: React.ReactElement;
};

export function LabelsProvider(props: LabelsProviderProps) {
  const hasWindow = typeof window !== 'undefined';
  const [labels, setLabels] = React.useState<Label[]>(
    (hasWindow &&
      window.localStorage.getItem('labels') &&
      JSON.parse(window.localStorage.getItem('labels'))) ||
      []
  );
  const getLabel = (id: string) => {
    return labels.find((l) => l.id === id);
  };
  const addLabel = (label: Label) => {
    if (getLabel(label.id)) {
      return false;
    }
    setLabels([...labels, label]);
    return true;
  };
  const removeLabel = (id: string) => {
    if (!getLabel(id)) {
      return false;
    }
    setLabels(labels.filter((l) => l.id !== id));
    return true;
  };
  const clear = () => {
    if (!labels.length) return false;
    setLabels([]);
    return true;
  };
  if (hasWindow) {
    window.localStorage.setItem('labels', JSON.stringify(labels));
  }
  return (
    <LabelsContext.Provider
      value={{ labels, getLabel, addLabel, removeLabel, clear }}
    >
      {props.children}
    </LabelsContext.Provider>
  );
}

type LabelButtonProps = {
  category: Category;
  group: ComponentGroup;
  component: Component;
};

export function LabelButton(props: LabelButtonProps) {
  if (!props.component.slug || !props.component.slug.length) return null;
  const id = `${props.category.slug}-${props.component.slug}`;
  return (
    <LabelsContext.Consumer>
      {({ getLabel, addLabel, removeLabel }) => {
        const label = getLabel(id);
        const onChange = () => {
          if (label) {
            removeLabel(label.id);
          } else {
            addLabel({
              id,
              name: props.component.name || props.component.id,
              description:
                props.component.description || props.component.fieldDescription,
              colour: props.group.colour,
              size: props.component.labelSize,
              qr: props.component.qr,
            });
          }
        };
        return <input type='checkbox' checked={!!label} onChange={onChange} />;
      }}
    </LabelsContext.Consumer>
  );
}

export function LabelList() {
  return (
    <LabelsContext.Consumer>
      {({ labels, removeLabel, clear }) => {
        if (!labels.length) return null;
        return (
          <>
            <button onClick={clear}>Clear</button>
            <Link href='/labels'>
              <a>Print Labels</a>
            </Link>
            <ul>
              {labels.map((label, i) => {
                const remove = () => {
                  removeLabel(label.id);
                };
                return (
                  <li key={i}>
                    {label.name} <button onClick={remove}>Remove</button>
                  </li>
                );
              })}
            </ul>
          </>
        );
      }}
    </LabelsContext.Consumer>
  );
}
