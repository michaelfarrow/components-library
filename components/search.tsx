import React from 'react';
import component, { styled, ComponentProps } from ':components/component';
import Category from ':types/Category';
import FuzzySearch from 'react-fuzzy';
import { useRouter } from 'next/router';
import FuzzyHighlighter, { Highlighter } from 'react-fuzzy-highlighter';

interface Props extends ComponentProps {
  categories: Category[];
}

const DISTANCE = 60;
const THRESHOLD = 0.3;

type HighlightedTextProps = {
  query: string;
  text: string;
};

const FUZE_DEFAULTS = {
  caseSensitive: false,
  include: [],
  location: 0,
  shouldSort: true,
  sortFn(a, b) {
    return a.score - b.score;
  },
  threshold: THRESHOLD,
  tokenize: false,
  verbose: false,
};

const HighlightedText: React.FC<HighlightedTextProps> = (props) => {
  return (
    <FuzzyHighlighter
      query={props.query}
      data={[{ text: props.text }]}
      options={{
        ...FUZE_DEFAULTS,
        distance: DISTANCE,
        keys: ['text'],
      }}
    >
      {({ results, formattedResults, timing }) => {
        if (!results.length) return props.text;
        return <mark>{props.text}</mark>;
        return <Highlighter text={formattedResults[0].formatted.text} />;
      }}
    </FuzzyHighlighter>
  );
};

function normalize(str: string) {
  return str;
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, ' ');
}

export default styled(
  component<Props>('Search', ({ className, categories }) => {
    const router = useRouter();

    const list = [];
    categories.forEach((category) => {
      category.groups.forEach((group) => {
        group.components.forEach((component) => {
          if (component.slug) {
            const description = component.fields.find(
              (f) => f.label.toLowerCase().trim() === 'description'
            );
            list.push({
              title: normalize(component.id),
              description:
                (description && normalize(description.value)) || null,
              group: normalize(group.name),
              item: { value: component.id },
              category: category.slug,
              component: component.slug,
            });
          }
        });
      });
    });

    const onSelect = (o) => {
      router.push(
        '/c/[category]/[component]',
        `/c/${o.category}/${o.component}`
      );
    };

    return (
      <FuzzySearch
        list={list}
        className={className}
        keys={['title', 'description', 'group']}
        distance={DISTANCE}
        threshold={THRESHOLD}
        width='100%'
        onSelect={onSelect}
        resultsTemplate={(props, state, styles, clickHandler) => {
          return state.results.map((val, i) => {
            const style =
              state.selectedIndex === i
                ? styles.selectedResultStyle
                : styles.resultsStyle;
            return (
              <div key={i} style={style} onClick={() => clickHandler(i)}>
                <HighlightedText text={val.title} query={state.value} />
                {(val.description && (
                  <>
                    {' '}
                    -{' '}
                    <HighlightedText
                      text={val.description}
                      query={state.value}
                    />
                  </>
                )) ||
                  ''}
              </div>
            );
          });
        }}
      />
    );
  })
)`
  position: relative;
  z-index: 100;

  mark {
    background-color: transparent;
    color: black;
    font-weight: bold;
  }

  > div:nth-of-type(2) {
    position: absolute !important;
  }
`;
