import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

const STORAGE_KEY = "acknowledgedAlarms";
const AcknowledgementContext = createContext(undefined);

export function AcknowledgementProvider({ children }) {
    const [acknowledgedIds, setAcknowledgedIds] = useState([]);
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);
    const [storageError, setStorageError] = useState(null);

    // read ACK list from AsyncStorage when app starts
    useEffect(() => {
        let isActive = true;
        
        async function loadAcknowledgedIds() {
            try {
                const savedValue = await AsyncStorage.getItem(STORAGE_KEY);
                if (!isActive) {
                    return;
                }
                if (savedValue === null) {
                    return;
                }
            
                const parsedValue = JSON.parse(savedValue);
                if (!Array.isArray(parsedValue)) {
                    throw new Error(
                        "Stored ackowledgement data is invalid."
                    );
                }
                const validIds = parsedValue.filter(
                    (id) => typeof id === "string"
                );

                setAcknowledgedIds(validIds);
                } catch (error) {
                    const message = error instanceof Error
                        ? error.message
                        : "Failed to load ackowledgement data.";
                    console.error("Failed to load ackowledged alarams:", error);

                    setStorageError(message);
                } finally {
                    if (isActive) {
                        setIsStorageLoaded(true);
                    }
                }
        }
        loadAcknowledgedIds();

        return () => {
            isActive = false;
        };
    }, []);

    // Store in AsyncStorage whenever ACk list changes
    useEffect(() => {
        if (!isStorageLoaded) {
            return;
        }
        
        async function saveAcknowledgedIds() {
            try {
                const serializedValue = JSON.stringify(acknowledgedIds);
                await AsyncStorage.setItem(STORAGE_KEY, serializedValue);

                setStorageError(null);
            } catch (error) {
                const message = error instanceof Error
                    ? error.message
                    : "Failed to save ackowledgement data.";
                
                console.error("Failed to save ackowledged alarms:", error);

                setStorageError(message);
            }
        }
        saveAcknowledgedIds();
    }, [acknowledgedIds, isStorageLoaded]);

    function acknowledge(assetId) {
        setAcknowledgedIds((previousIds) => {
            if (previousIds.includes(assetId)) {
                return previousIds;
            }
            return [...previousIds, assetId];
        });
    }

    function unacknowledge(assetId) {
        setAcknowledgedIds((previousIds) => 
            previousIds.filter((id) => id !== assetId)
        );
    }

    function isAcknowledged(assetId) {
        return acknowledgedIds.includes(assetId);
    }

    const contextValue = {
        acknowledgedIds,
        acknowledge,
        unacknowledge,
        isAcknowledged,
        isStorageLoaded,
        storageError,
      };

    return (
        <AcknowledgementContext.Provider value={contextValue}>
            {children}
        </AcknowledgementContext.Provider>    
    );
}

// Custom hook to use the AcknowledgementContext
export function useAcknowledgements() {
    const context = useContext(AcknowledgementContext);
    if (context === undefined) {
        throw new Error(
            "useAcknowledgement must be used inside AcknowledgementProvider."
        );
    }
    return context;
}