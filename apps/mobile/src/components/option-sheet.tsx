import { Check, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, View } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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

const normalize = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const term = normalize(query.trim());
    const matches = term
      ? options.filter((o) => normalize(o.label).includes(term))
      : options;
    return term ? matches : [{ value: "", label: allLabel }, ...matches];
  }, [options, query, allLabel]);

  const close = () => {
    setQuery("");
    onClose();
  };
  const choose = (next: string) => {
    onSelect(next);
    close();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={close}
          accessibilityLabel="Fechar"
        />
        {/* Animated.View only animates: NativeWind does not style it, so the
            panel's classes live on the View inside. */}
        <Animated.View
          entering={SlideInDown.duration(220)}
          style={{ maxHeight: "80%" }}
        >
          <View
            className="border-t border-border bg-card"
            style={{ paddingBottom: insets.bottom, maxHeight: "100%" }}
          >
            <View className="items-center pt-3">
              <View className="h-1 w-8 bg-muted-foreground/40" />
            </View>
            <View className="flex-row items-center justify-between py-1 pl-4 pr-1">
              <Text className="font-heading text-lg font-semibold">
                {title}
              </Text>
              <Pressable
                onPress={close}
                className="size-12 items-center justify-center active:bg-accent"
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <X size={20} className="text-foreground" />
              </Pressable>
            </View>
            {options.length > 10 ? (
              <View className="px-4 pb-2">
                <View className="justify-center">
                  <Input
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Buscar"
                    className="pl-10"
                    autoCorrect={false}
                    accessibilityLabel={`Buscar em ${title}`}
                  />
                  <Search
                    size={18}
                    className="absolute left-3 text-muted-foreground"
                  />
                </View>
              </View>
            ) : null}
            <FlatList
              data={rows}
              keyExtractor={(option) => option.value || "all"}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Pressable
                    onPress={() => choose(item.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className={cn(
                      "min-h-12 flex-row items-center justify-between px-4 active:bg-accent",
                      selected && "bg-primary/10",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        selected && "font-semibold text-primary",
                      )}
                    >
                      {item.label}
                    </Text>
                    {selected ? (
                      <Check size={18} className="text-primary" />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text className="px-4 py-6 text-center text-muted-foreground">
                  Nada encontrado.
                </Text>
              }
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
