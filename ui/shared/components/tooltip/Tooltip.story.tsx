import type { StoryProps } from '~/test/componentTests/StoryProps';
import { TestApp } from '~/test/componentTests/TestApp';
import { Tooltip } from './Tooltip';

export type TooltipStoryProps = StoryProps & {
  text: string;
};

export const TooltipStory: React.FC<TooltipStoryProps> = ({ testApp, text }) => (
  <TestApp {...testApp}>
    <Tooltip<HTMLDivElement> text={text}>
      {({ htmlProps }) => <div {...htmlProps}>Test</div>}
    </Tooltip>
  </TestApp>
);
