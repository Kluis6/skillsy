import { Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// "all" instead of "": the web Select (Radix) rejects empty item values.
const ALL = 'all';

type FilterSelectProps = {
  label: string;
  allLabel: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

/** One of the list filters (service, state); "" means no filter. */
export function FilterSelect({ label, allLabel, options, value, onChange }: FilterSelectProps) {
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      className="flex-1"
      value={selected ?? { value: ALL, label: allLabel }}
      onValueChange={(option) => onChange(!option || option.value === ALL ? '' : option.value)}>
      <SelectTrigger className="w-full" aria-label={label}>
        <SelectValue placeholder={allLabel} className="text-sm" />
      </SelectTrigger>
      <SelectContent
        insets={{ top: insets.top, bottom: insets.bottom, left: 12, right: 12 }}
        className="w-64">
        <ScrollView className="max-h-80" scrollEnabled={Platform.OS !== 'web'}>
          <SelectItem value={ALL} label={allLabel}>
            {allLabel}
          </SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} label={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </ScrollView>
      </SelectContent>
    </Select>
  );
}
