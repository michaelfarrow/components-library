import component, { styled, ComponentProps } from ':components/component';
import { ComponentField } from ':types/Component';

interface Props extends ComponentProps {
  field: ComponentField;
}

function renderField(field: ComponentField) {
  switch (field.label.trim().toLowerCase()) {
    case 'rs components code':
    case 'rs code':
      if (field.value && field.value.trim().length) {
        return (
          <a
            href={`https://uk.rs-online.com/web/c/?searchTerm=${field.value.trim()}`}
            target='_blank'
            rel='noreferrer'
          >
            {field.value}
          </a>
        );
      } else {
        return field.value;
      }
      break;
    default:
      return field.value;
  }
}

export default styled(
  component<Props>('ComponentFieldValue', ({ className, field }) => {
    return <span className={className}>{renderField(field)}</span>;
  })
)``;
