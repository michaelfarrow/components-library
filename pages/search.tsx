import { GetStaticProps } from 'next';
import { getData } from ':util/data';
import Category from ':types/Category';
import Search from ':components/search';

type HomeProps = {
  categories: Category[];
};

export default function Home(props: HomeProps) {
  return (
    <div>
      <Search categories={props.categories} />
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const data = await getData();
  return {
    props: {
      categories: data.categories,
    },
  };
};
