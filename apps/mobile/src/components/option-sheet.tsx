import { Check, Search } from '@/lib/icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type SheetOption = { value: string; label: string };

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: readonly SheetOption[];
  /** "" means no filter; the first row ("allLabel") selects it. */
  value: string;
  allLabel: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Bottom sheet for picking one value from a long list (services, states),
 * with search. Built with the app's own components so it keeps the
 * platform's look (square corners, brand colors, Inter) on Android and web. */
export function OptionSheet({
  visible,
  title,
  options,
  value,
  allLabel,
  onSelect,
  onClose,
}: OptionSheetProps) {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const term = normalize(query.trim());
    const matches = term ? options.filter((o) => normalize(o.label).includes(term)) : options;
    return term ? matches : [{ value: '', label: allLabel }, ...matches];
  }, [options, query, allLabel]);

  const close = () => {
    setQuery('');
    onClose();
  };
  const choose = (next: string) => {
    onSelect(next);
    close();
  };

  return (
    <Sheet visible={visible} title={title} onClose={close}>
      {options.length > 10 ? (
        <View className="px-4 pb-2">
          <View className="justify-center">
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar"
              className="h-10 pl-10"
              autoCorrect={false}
              accessibilityLabel={`Buscar em ${title}`}
            />
            <Search size={18} className="absolute left-3 text-muted-foreground" />
          </View>
        </View>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(option) => option.value || 'all'}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const selected = item.value === value;
          return (
            <Pressable
              onPress={() => choose(item.value)}
              accessibilityRole="button"
              aria-selected={selected}
              className={cn(
                'min-h-12 flex-row items-center justify-between px-4 active:bg-accent',
                selected && 'bg-primary/10'
              )}>
              <Text className={cn('text-base', selected && 'font-semibold text-primary')}>
                {item.label}
              </Text>
              {selected ? <Check size={18} className="text-primary" /> : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text className="px-4 py-6 text-center text-muted-foreground">Nada encontrado.</Text>
        }
      />
    </Sheet>
  );
}
