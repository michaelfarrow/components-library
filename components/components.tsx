import component, { styled, ComponentProps } from ':components/component';
import Category from ':types/Category';
import Link from 'next/link';
import ComponentFieldValue from ':components/component-field-value';

interface Props extends ComponentProps {
  category: Category;
}

function createTable(category: Category) {
  return (
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Quantity</th>
          {category.headers.map((header, i) => (
            <th key={i}>{header.title}</th>
          ))}
          <th>Datasheet</th>
        </tr>
      </thead>
      {category.groups.map((group, i) => {
        return (
          <tbody key={i}>
            {(group.name && (
              <tr>
                <td
                  key={i}
                  className='components__group'
                  colSpan={category.headers.length + 3}
                >
                  {group.name}
                </td>
              </tr>
            )) ||
              null}
            {group.components.map((component, i) => {
              const { id, slug, quantity, fields, datasheet } = component;
              return (
                <tr key={i}>
                  <td>
                    {(id && (
                      <Link
                        href='/c/[category]/[component]'
                        as={`/c/${category.slug}/${slug}`}
                      >
                        <a>{id}</a>
                      </Link>
                    )) ||
                      null}
                  </td>
                  <td>{quantity}</td>
                  {fields.map((field, i) => (
                    <td key={i}>
                      <ComponentFieldValue field={field} />
                    </td>
                  ))}
                  <td>
                    {datasheet && (
                      <a
                        className='datasheet__tick'
                        target='_blank'
                        rel='noreferrer'
                        href={datasheet}
                        title='Datasheet'
                      >
                        ✓
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        );
      })}
    </table>
  );
}

export default styled(
  component<Props>('Components', ({ className, category }) => {
    const table = createTable(category);
    return <div className={className}>{table}</div>;
  })
)`
  padding-bottom: 1em;
  margin-top: 2em;
  margin-left: -1em;
  margin-right: -1em;
  overflow-x: auto;
  position: relative;

  table {
    border-spacing: 0;
    padding-left: 0.25em;
    padding-right: 0.25em;

    th {
      font-weight: 700;
    }

    td,
    th {
      padding: 0.5em 0.75em;
      white-space: nowrap;
      text-align: left;

      &.components__group {
        font-weight: 700;
        border-bottom: 2px solid #666;
        padding-top: 1em;
      }
    }

    tbody tr:nth-child(2n) td {
      background-color: #efefef;
    }
  }
`;
