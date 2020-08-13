import component, { styled, ComponentProps } from ':components/component';
import { ComponentField } from ':types/Component';
import ComponentFieldValue from ':components/component-field-value';

interface Props extends ComponentProps {
  fields: ComponentField[];
}

export default styled(
  component<Props>('ComponentFields', ({ className, fields }) => {
    const _fields =
      (fields && fields.filter((field) => field.value && field.value.length)) ||
      [];
    if (!_fields.length) return null;
    return (
      <table className={className}>
        {_fields.map((field, i) => (
          <tr key={i}>
            <th>{field.label}</th>
            <td>
              <ComponentFieldValue field={field} />
            </td>
          </tr>
        ))}
      </table>
    );
  })
)`
  th {
    text-align: left;
  }

  @media only screen and (max-width: 500px) {
    tr {
      display: block;
    }

    th,
    td {
      display: inline;
    }

    th {
      &::after {
        content: ': ';
      }
    }
  }
`;
