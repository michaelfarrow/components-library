import component, { styled, ComponentProps } from ':components/component';
import { Label } from ':components/labels';

const LABEL_UNIT_SIZE = 30;
const LABEL_SIZE_MAX = 50;
const DESCRIPTION_SEPERATOR = ' ';

interface Props extends ComponentProps {
  label: Label;
}

export default styled(
  component<Props>('Label', ({ className, label }) => {
    const { description } = label;
    return (
      <div
        className={className}
        style={{
          width: `${Math.min(LABEL_UNIT_SIZE * label.size, LABEL_SIZE_MAX)}mm`,
        }}
      >
        <div className='trim-mark trim-mark__tl' />
        <div className='trim-mark trim-mark__tr' />
        <div className='trim-mark trim-mark__bl' />
        <div className='trim-mark trim-mark__br' />
        <div
          className='colour'
          style={{ backgroundColor: label.colour || '#000000' }}
        />
        <div className='info'>
          <h2>{label.name}</h2>
          {(description && (
            <p>
              {Array.isArray(description)
                ? description.join(DESCRIPTION_SEPERATOR)
                : description}
            </p>
          )) ||
            null}
        </div>
        {(label.qr && (
          <div className='qr'>
            <img src={label.qr} />
          </div>
        )) ||
          null}
      </div>
    );
  })
)`
  --height: 10mm;
  --padding: 1mm;

  --trim-mark-thickness: 0.1mm;

  --bleed: 1.5mm;

  --colour-size: 1.25mm;

  --info-padding: 2mm;

  --name-size: 4mm;
  --description-size: 2mm;
  --description-line-height: 1;

  --name-top-offset: -1mm;
  --name-top-bottom: -1mm;
  --description-top-offset: 0mm;
  --description-bottom-offset: -0.35mm;

  --trim-mark-size: 5mm;
  --trim-mark-offset: calc(
    var(--trim-mark-size) * -1 + calc(var(--trim-mark-thickness) / 2)
  );

  --qr-size: calc(var(--height) - calc(var(--padding) * 2));

  height: var(--height);
  display: flex;
  padding: var(--padding);
  box-sizing: border-box;
  position: relative;
  margin: calc(var(--trim-mark-size) * 1.25) var(--trim-mark-size);
  justify-content: space-between;
  align-items: center;

  @media screen {
    overflow: hidden;
    box-shadow: 0 0 2mm 0 rgba(0, 0, 0, 0.2);
  }

  .trim-mark {
    position: absolute;
    width: var(--trim-mark-size);
    height: var(--trim-mark-size);

    &::before,
    &::after {
      display: block;
      content: '';
      position: absolute;
    }

    &::before {
      width: 75%;
      height: 0;
      border-top: calc(var(--trim-mark-thickness)) solid black;
    }

    &::after {
      border-left: var(--trim-mark-thickness) solid black;
      width: 0;
      height: 75%;
    }
  }

  .trim-mark__tl {
    top: var(--trim-mark-offset);
    left: var(--trim-mark-offset);

    &::before {
      bottom: 0;
      left: 0;
    }

    &::after {
      top: 0;
      right: 0;
    }
  }

  .trim-mark__tr {
    top: var(--trim-mark-offset);
    right: var(--trim-mark-offset);

    &::before {
      bottom: 0;
      right: 0;
    }

    &::after {
      top: 0;
      left: 0;
    }
  }

  .trim-mark__bl {
    bottom: var(--trim-mark-offset);
    left: var(--trim-mark-offset);

    &::before {
      top: 0;
      left: 0;
    }

    &::after {
      bottom: 0;
      right: 0;
    }
  }

  .trim-mark__br {
    bottom: var(--trim-mark-offset);
    right: var(--trim-mark-offset);

    &::before {
      top: 0;
      right: 0;
    }

    &::after {
      bottom: 0;
      left: 0;
    }
  }

  .colour {
    position: absolute;
    top: calc(var(--bleed) * -1);
    bottom: calc(var(--bleed) * -1);
    left: calc(var(--bleed) * -1);
    width: calc(var(--colour-size) + var(--bleed));
    z-index: -1;
  }

  .info {
    margin: calc(var(--padding) * -1) 0;
    padding: 0 var(--info-padding);

    h2 {
      margin: 0;
      margin-top: var(--name-top-offset);
      margin-bottom: var(--name-bottom-offset);
      font-size: var(--name-size);
    }

    p {
      margin: 0;
      margin-top: var(--description-top-offset);
      margin-bottom: var(--description-bottom-offset);
      font-family: 'Roboto Mono', monospace;
      font-weight: 300;
      font-size: var(--description-size);
      line-height: var(--description-line-height);
    }
  }

  .qr {
    display: flex;
    width: var(--qr-size);
    height: var(--qr-size);
    position: relative;
    flex-shrink: 0;

    img {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
`;
