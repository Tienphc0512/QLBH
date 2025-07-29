import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const Auth = createContext(); 

export const AuthProvider = ({ children }) => { 
  const [authState, setAuthState] = useState({  // theoi dõi trạng thái xác thực
    token: null, 
     userId: null,
    isLoading: true  
  });
 useEffect(() => {
  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedNewUserId = JSON.parse(await AsyncStorage.getItem('userId'));
      console.log("[AuthContext] Loaded token:", storedToken);
      console.log("[AuthContext] Loaded userId:", storedNewUserId);

      setAuthState({
        token: storedToken,
        userId: storedNewUserId,
        isLoading: false
      });
    } catch (err) {
      console.error("Lỗi khi load token:", err);
      setAuthState({
        token: null,
        userId: null,
        isLoading: false
      });
    }
  };
  loadToken();
}, []);


  const login = async (newToken, newUserId) => {
    await AsyncStorage.setItem('token', newToken); 
    await AsyncStorage.setItem('userId', JSON.stringify(newUserId));
    setAuthState({ 
      token: newToken,
      userId: newUserId,
      isLoading: false
    });
  };
  
  const logout = async () => {
    await AsyncStorage.removeItem('token'); 
    await AsyncStorage.removeItem('userId'); 
    setAuthState({ 
      token: null, 
      userId: null,
      isLoading: false
    });
  };
  return (
    <Auth.Provider value={{
      token: authState.token,
       userId: authState.userId,
      isLoading: authState.isLoading,
      login,
      logout
    }}>
      {children} 
    </Auth.Provider>
  );
};

export const useAuth = () => useContext(Auth);
//useContext là hook có sẵn của React để lấy dữ liệu từ một Context.