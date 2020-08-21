import { LabelsContext } from ':components/labels';
import Label from ':components/label';
import NoSSR from 'react-no-ssr';

export default function Labels() {
  return (
    <LabelsContext.Consumer>
      {({ labels }) => {
        return (
          <NoSSR>
            <div>
              {labels.map((label, i) => (
                <Label key={i} label={label} />
              ))}
            </div>
          </NoSSR>
        );
      }}
    </LabelsContext.Consumer>
  );
}
