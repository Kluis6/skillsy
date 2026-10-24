import type { LucideIcon } from '@/lib/icons';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type ScreenPlaceholderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

// Temporary screen body until each tab gets its real content.
export function ScreenPlaceholder({ icon: Icon, title, description }: ScreenPlaceholderProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <Text className="text-2xl font-bold text-brand">Skillsy</Text>
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <View className="bg-primary/10 p-3">
              <Icon size={24} className="text-primary" />
            </View>
            <View className="flex-1 gap-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </View>
          </CardHeader>
          <CardContent>
            <Text className="text-sm text-muted-foreground">Em construção.</Text>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
}
