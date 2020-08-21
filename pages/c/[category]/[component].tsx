import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { getData, getComponent } from ':util/data';
import Category from ':types/Category';
import ComponentGroup from ':types/ComponentGroup';
import Component from ':types/Component';
import Breadcrumbs from ':components/breadcrumbs';
import ComponentFields from ':components/component-fields';
import Head from 'next/head';
import Layout from ':components/layout';
import { LabelsContext } from ':components/labels';

type ComponentProps = {
  category: Category;
  group: ComponentGroup;
  component: Component;
};

type ComponentParams = {
  category: string;
  component: string;
};

export default function ComponentPage(props: ComponentProps) {
  const { category, component } = props;
  const [dsLoaded, setDsLoaded] = useState(false);

  const onLoaded = () => {
    setDsLoaded(true);
  };

  return (
    <Layout>
      <Head>
        <title>
          {component.id} | {category.title}
        </title>
      </Head>
      <h2>
        Component: {component.id}{' '}
        <span className='component__quantity'>{component.quantity}</span>
      </h2>
      <Breadcrumbs category={category} component={component} />
      <section>
        <ComponentFields fields={component.fields} />
        {(component.datasheet && (
          <div>
            <a
              className='button button__datasheet'
              target='_blank'
              rel='noreferrer'
              href={component.datasheet}
            >
              Datasheet
            </a>
            {(component.qr && <img src={component.qr} />) || null}
            <div className='component__datasheet-preview-wrapper'>
              <div className='component__datasheet-preview'>
                <div
                  className={`iframe__wrapper ${
                    dsLoaded ? '' : 'iframe--loading'
                  }`}
                >
                  <iframe
                    src={component.datasheetPreview}
                    onLoad={onLoaded}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        )) ||
          null}
      </section>
    </Layout>
  );
}

{
  /* <dl className='component__fields'>
{fields.map((field, i) => (
  <Fragment key={i}>
    <dt>{field.label}</dt>
    <dd>{field.value}</dd>
  </Fragment>
))}
</dl> */
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await getData();
  const paths = [];
  data.categories.forEach((category) => {
    category.groups.forEach((group) => {
      group.components.forEach((component) => {
        if (component.slug) {
          paths.push({
            params: {
              category: category.slug,
              component: component.slug,
            },
          });
        }
      });
    });
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ComponentProps,
  ComponentParams
> = async ({ params }) => {
  const data = await getComponent(params.category, params.component);
  return {
    props: data,
  };
};
