import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "react-native";
import { AuthProvider, useAuth } from "./context/Auth";
import { CartProvider } from "./context/CartContext"; 

import TrangChu from "./components/TrangChu";
import GioHang from "./components/GioHang";
import DonHang from "./components/DatHang";
import Chatbot from "./components/Chatbot";
import TaiKhoan from "./components/TaiKhoan";
import DangNhap from "./components/DangNhap";
import DangKy from "./components/DangKy";
// import Chiietsanpham from "./components/Chitietsanpham";
// import Danhmuc from "./components/Danhmuc";
// import Sanpham from "./components/Sanpham"; 

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

// Tab sau khi đăng nhập
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Trang chủ" component={TrangChu} />
      <Tab.Screen name="Giỏ hàng" component={GioHang} />
      <Tab.Screen name="Đơn hàng" component={DonHang} />
      <Tab.Screen name="Chatbot" component={Chatbot} />
      <Tab.Screen name="Tài khoản" component={TaiKhoan} />
      {/* <Tab.Screen name="Danh mục" component={Danhmuc} />
      <Tab.Screen name="Sản phẩm" component={Sanpham} />  
      <Tab.Screen name="Chi tiết sản phẩm" component={Chiietsanpham} /> */}
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
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
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
