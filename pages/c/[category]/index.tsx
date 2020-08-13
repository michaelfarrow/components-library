import { GetStaticProps, GetStaticPaths } from 'next';
import { getData, getCategory } from ':util/data';
import Category from ':types/Category';
import Components from ':components/components';
import Breadcrumbs from ':components/breadcrumbs';
import Search from ':components/search';
import Head from 'next/head';

type CategoryProps = {
  category: Category;
};

type CategoryParams = {
  category: string;
};

export default function CategoryPage(props: CategoryProps) {
  const { category } = props;
  return (
    <div>
      <h1>Category: {category.title}</h1>
      <Head>
        <title>{category.title}</title>
      </Head>
      <Search categories={[category]} />
      <Breadcrumbs category={category} />
      <Components category={category} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths<CategoryParams> = async () => {
  const data = await getData();
  return {
    paths: data.categories.map((category) => ({
      params: { category: category.slug },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  CategoryProps,
  CategoryParams
> = async ({ params }) => {
  const category = await getCategory(params.category);
  return {
    props: {
      category,
    },
  };
};
