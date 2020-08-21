import component, { styled, ComponentProps } from ':components/component';
import Category from ':types/Category';
import Component from ':types/Component';
import Link from 'next/link';

interface Props extends ComponentProps {
  category?: Category;
  component?: Component;
}

export default styled(
  component<Props>('Breadcrumbs', ({ className, category, component }) => {
    return (
      <ul className={className}>
        <li>
          {category || component ? (
            <Link href='/'>
              <a>Home</a>
            </Link>
          ) : (
            'Home'
          )}
        </li>
        {(category || component) && (
          <>
            <li>
              {category && component ? (
                <Link href='/c/[category]' as={`/c/${category.slug}`}>
                  <a>{category.title}</a>
                </Link>
              ) : (
                category.title
              )}
            </li>
            {component && <li>{component.id}</li>}
          </>
        )}
      </ul>
    );
  })
)`
  list-style-type: none;
  margin: 0;
  padding: 0;
  margin-bottom: 2em;

  li {
    display: inline-block;
  }

  li::before {
    content: '>';
    display: inline-block;
    padding: 0em 0.3em 0em 0.3em;
    color: #bbb;
  }

  li:first-of-type::before {
    display: none;
  }
`;
