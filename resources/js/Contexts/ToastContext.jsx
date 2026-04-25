import { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const toast = useRef(null);

    const showToast = (severity, summary, detail, life = 3000) => {
        toast.current?.show({ severity, summary, detail, life });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            <Toast ref={toast} />
            {children}
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
