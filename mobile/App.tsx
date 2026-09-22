import './global.css';
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from './src/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './src/components/ui/card';
import { Input } from './src/components/ui/input';
import { Badge } from './src/components/ui/badge';

export default function App() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <ScrollView contentContainerClassName="p-5">
        {/* Header */}
        <View className="mb-6 items-center">
          <Badge variant="default" label="FPT Campus Marketplace" className="mb-2" />
          <Text className="text-2xl font-black text-primary">FU Second-hand</Text>
          <Text className="text-sm text-slate-500">Giao diện shadcn UI trên Mobile (NativeWind v4)</Text>
        </View>

        {/* Search Box */}
        <View className="mb-6">
          <Input
            placeholder="🔍 Tìm kiếm đồ phòng trọ, giáo trình, xe đạp..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Demo Card Sản Phẩm theo phong cách shadcn */}
        <Card className="mb-4">
          <CardHeader>
            <View className="flex-row items-center justify-between">
              <Badge variant="secondary" label="Đồ phòng trọ" />
              <Badge variant="outline" label="Campus HOL" />
            </View>
            <CardTitle className="mt-2 text-lg">Nồi cơm điện Cuckoo 1.8L</CardTitle>
            <CardDescription>Tình trạng: Mới 95%, nấu cơm ngon, pass lại cho sinh viên mới vào KTX</CardDescription>
          </CardHeader>
          <CardContent>
            <Text className="text-2xl font-bold text-primary">250.000 đ</Text>
          </CardContent>
          <CardFooter className="justify-between space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Text className="font-semibold text-slate-700">Chat người bán</Text>
            </Button>
            <Button variant="default" size="sm" className="flex-1">
              <Text className="font-semibold text-white">Mua ngay</Text>
            </Button>
          </CardFooter>
        </Card>

        {/* Demo Buttons */}
        <View className="mt-4 space-y-2">
          <Text className="mb-2 font-bold text-slate-700">Các nút Button Variants:</Text>
          <Button variant="default" label="Primary Button (Màu cam FPT)" className="mb-2" />
          <Button variant="secondary" label="Secondary Button" className="mb-2" />
          <Button variant="destructive" label="Destructive Button" className="mb-2" />
          <Button variant="outline" label="Outline Button" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
