import { createContext, useContext } from "react";
import { useIsMe } from "@/hooks/useAuth";

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
    const {
        data: user,
        isPending: isAuthLoading,
        isError: isAuthError,
    } = useIsMe();

    const contextValue = {
        user: user,
        isAuthLoading,
        isAuthError,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within AppProvider");
    }
    return context;
};
