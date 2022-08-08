import { Symbol } from '@/components/Map/Legend/Content/symbol';
import { Text } from '@/components/Map/Legend/Content/text';

type props = {
  name: string;
  color: number[];
};

export const Entry = (props: props) => {
  const { name, color } = props;
  return (
    <div className="flex m-0 px-2 items-center">
      <Symbol color={color} />
      <Text name={name} />
    </div>
  );
};
