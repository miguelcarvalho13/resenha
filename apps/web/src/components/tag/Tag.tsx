import { useTranslation } from 'react-i18next';

import { type Tag as TagModel } from '@/models/tags';
import { TagWrapper, type TagWrapperProps } from './TagWrapper';
import { TAG_COLOR } from '@/utils/tags';

interface TagProps extends Omit<TagWrapperProps, 'children'> {
  name: TagModel['name'];
  type: TagModel['type'];
}

export const Tag = ({ name, type, ...props }: TagProps) => {
  const { t } = useTranslation();

  return (
    <TagWrapper color={TAG_COLOR[type]} {...props}>
      {name}
      {t(($) => $.tags.newTagSuffix, { context: type })}
    </TagWrapper>
  );
};
