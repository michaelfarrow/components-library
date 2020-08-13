import ComponentGroup from './ComponentGroup';

type CategoryHeader = {
  index: number;
  title: string;
};

type Category = {
  slug: string;
  title: string;
  headers: CategoryHeader[];
  groups: ComponentGroup[];
};

export default Category;
