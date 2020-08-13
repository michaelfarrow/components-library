import fs from 'fs-extra';
import Category from ':types/Category';
import Component from ':types/Component';
import ComponentGroup from ':root/types/ComponentGroup';

export async function getData(): Promise<{
  lastModified: string;
  categories: Category[];
}> {
  return await fs.readJSON('data/info.json');
}

export async function getCategory(category: string): Promise<Category | null> {
  const data = await getData();
  return data.categories.find((cat) => cat.slug === category) || null;
}

export async function getComponent(
  category: string,
  component: string
): Promise<{
  category: Category;
  component: Component;
  group: ComponentGroup;
} | null> {
  const cat = await getCategory(category);
  if (!cat) return null;
  let comp = null;
  const group = cat.groups.find((g) =>
    g.components.find((c) => {
      if (c.slug === component) {
        comp = c;
        return true;
      }
    })
  );
  if (!comp) return null;
  return {
    category: cat,
    group,
    component: comp,
  };
}
