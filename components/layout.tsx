import { LabelList } from ':components/labels';
import NoSSR from 'react-no-ssr';

type LayoutProps = {
  children: React.ReactElement[];
};

export default function Layout(props: LayoutProps) {
  return (
    <>
      <header>
        <h1>Components</h1>
        <NoSSR>
          <LabelList />
        </NoSSR>
      </header>
      <section>{props.children}</section>
    </>
  );
}
