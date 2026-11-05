import { X } from '@/lib/icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** false for a required step: no close button, backdrop or back gesture. */
  dismissable?: boolean;
};

/** Bottom sheet shell (Material 3 modal bottom sheet) in the platform's look:
 * square corners, brand colors, Inter. Same on Android and web. */
export function Sheet({ visible, title, onClose, children, dismissable = true }: SheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissable ? onClose : () => {}}
      statusBarTranslucent
      navigationBarTranslucent>
      <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/40"
          onPress={dismissable ? onClose : undefined}
          accessibilityLabel="Fechar"
        />
        {/* Animated.View only animates: NativeWind does not style it, so the
            panel's classes live on the View inside. */}
        <Animated.View entering={SlideInDown.duration(220)} style={{ maxHeight: '85%' }}>
          <View
            className="border-t border-border bg-card"
            style={{ paddingBottom: insets.bottom, maxHeight: '100%' }}>
            <View className="items-center pt-3">
              <View className="h-1 w-8 bg-muted-foreground/40" />
            </View>
            <View className="flex-row items-center justify-between py-1 pl-4 pr-1">
              <Text className="font-heading text-lg font-semibold">{title}</Text>
              {dismissable ? (
                <Pressable
                  onPress={onClose}
                  className="size-12 items-center justify-center active:bg-accent"
                  accessibilityRole="button"
                  accessibilityLabel="Fechar">
                  <X size={20} className="text-foreground" />
                </Pressable>
              ) : (
                <View className="size-12" />
              )}
            </View>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
