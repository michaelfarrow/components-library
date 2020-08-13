import { useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import fs from 'fs-extra';

type DatasheetProps = {
  url: string;
};

type DatasheetParams = {
  component: string;
};

export default function Datasheet(props: DatasheetProps) {
  useEffect(() => {
    window.location.href = props.url;
  }, []);

  return (
    <>
      Redirecting to <a href={props.url}>{props.url}</a>
    </>
  );
}

async function getLinks() {
  return fs.readJSON('data/links.json');
}

export const getStaticPaths: GetStaticPaths<DatasheetParams> = async () => {
  const links = await getLinks();
  const keys = Object.keys(links);
  return {
    paths: keys.map((key) => ({
      params: {
        component: key,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  DatasheetProps,
  DatasheetParams
> = async ({ params }) => {
  const links = await getLinks();
  return {
    props: {
      url: links[params.component],
    },
  };
};
