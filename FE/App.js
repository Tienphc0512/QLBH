import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "./context/Auth";
import { CartProvider } from "./context/CartContext";
import Ionicons from 'react-native-vector-icons/Ionicons';

import TrangChu from "./components/TrangChu";
import GioHang from "./components/GioHang";
import DonHang from "./components/DatHang";
import Chatbot from "./components/Chatbot";
import TaiKhoan from "./components/TaiKhoan";

import DangNhap from "./components/DangNhap";
import DangKy from "./components/DangKy";

import Chitietsanpham from "./components/Chitietsanpham";
import Danhmuc from "./components/Danhmucsp";
import Sanpham from "./components/Sanpham";
import LichSuChatBot from "./components/LichSuChatBot";
import TimKiem from "./components/TimKiem"; 
import ThongBao from "./components/ThongBao";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A6FA5',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#2D3748',
    border: '#E2E8F0',
  },
};

// Tabs sau khi đăng nhập
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Trang chủ') iconName = 'home-outline';
          else if (route.name === 'Giỏ hàng') iconName = 'cart-outline';
          else if (route.name === 'Đơn hàng') iconName = 'receipt-outline';
          // else if (route.name === 'Chatbot') iconName = 'chatbubbles-outline';
          else if (route.name === 'Tài khoản') iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A6FA5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Ẩn header nếu bạn không cần trên từng tab
      })}
    >
      <Tab.Screen name="Trang chủ" component={TrangChu} />
      <Tab.Screen name="Giỏ hàng" component={GioHang} />
      <Tab.Screen name="Đơn hàng" component={DonHang} />
      {/* <Tab.Screen name="Chatbot" component={Chatbot} /> */}
      <Tab.Screen name="Tài khoản" component={TaiKhoan} />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { token } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={token ? "MainTabs" : "Đăng nhập"}
      screenOptions={{
        headerStyle: {
          backgroundColor: AppTheme.colors.card,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: AppTheme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: AppTheme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      {token ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="DanhMuc" component={Danhmuc} options={{ title: "Danh mục" }} />
          <Stack.Screen
            name="SanPham"
            component={Sanpham}
            options={({ route }) => ({
              title: route.params?.danhmucTen || 'Sản phẩm',
            })}
          />
          <Stack.Screen
            name="Chitietsanpham"
            component={Chitietsanpham}
            options={{ title: "Chi tiết sản phẩm" }}
          />
          <Stack.Screen name="Đặt hàng" component={DonHang} options={{ title: "Đặt hàng" }} />
          <Stack.Screen name="Lịch Sử Chatbot" component={LichSuChatBot} options={{ title: "Lịch sử chat" }} />
          <Stack.Screen name="Tìm kiếm" component={TimKiem} options={{ title: "Tìm kiếm" }} />
          <Stack.Screen name="Thông báo" component={ThongBao} options={{ title: "Thông báo" }} />
          <Stack.Screen name="Chatbot" component={Chatbot} options={{ title: "Chat với AI" }} />
          <Stack.Screen name="Chi tiết sản phẩm" component={Chitietsanpham} options={{ title: "Chi tiết sản phẩm" }} />
          <Stack.Screen name="Sản phẩm" component={Sanpham} options={{ title: "Sản phẩm" }} />
          <Stack.Screen name="Danh mục sản phẩm" component={Danhmuc} options={{ title: "Danh mục sản phẩm" }} />
        
          
        </>
      ) : (
        <>
          <Stack.Screen name="Đăng nhập" component={DangNhap} options={{ headerShown: false }} />
          <Stack.Screen name="Đăng ký" component={DangKy} options={{ title: '' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={AppTheme.colors.background}
        />
        <NavigationContainer theme={AppTheme}>
          <MainNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
