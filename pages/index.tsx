import { GetStaticProps } from 'next';
import { getData } from ':util/data';
import Link from 'next/link';
import Category from ':types/Category';
import Breadcrumbs from ':components/breadcrumbs';
import Layout from ':components/layout';

type HomeProps = {
  categories: Pick<Category, 'slug' | 'title'>[];
};

export default function Home(props: HomeProps) {
  return (
    <Layout>
      <Breadcrumbs />
      <ul>
        {props.categories.map((cat, i) => (
          <li key={i}>
            <Link href='/c/[category]' as={`/c/${cat.slug}`}>
              <a>{cat.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await getData();
  return {
    props: {
      categories: data.categories.map((o) => ({
        title: o.title,
        slug: o.slug,
      })),
    },
  };
};
