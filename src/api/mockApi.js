import { MOCK_ASSETS } from '../data/mockAssets';

let liveAssets = MOCK_ASSETS.map(cloneAsset);

function cloneAsset(asset) {
    return {
        ...asset,
        thresholds: {
            ...asset.thresholds,
        }, // Note: [...MOCK_ASSETS] is not a valid copy!
    };
}

function wait(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

export async function login(username, password) {
    // wait 600ms like a real API
    await wait(600);
  
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
  
    if (!trimmedUsername || !trimmedPassword) {
      throw new Error(
        "Username and password are required."
      );
    }
  
    // test for login failure UI
    if (trimmedPassword === "wrong") {
      throw new Error("Invalid username or password.");
    }
  
    return {
      token: `mock-token-${Date.now()}`,
      username: trimmedUsername,
    };
  }

export async function fetchAssets() {
    // wait 800ms like actual network request
    await wait(800);

    // request fail with 10% probability
    const shouldFail = Math.random() < 0.1;
    if (shouldFail) {
        throw new Error('Failed to fetch assets');
    } 

    return liveAssets.map(cloneAsset);
}

export async function fetchAssetDetail(id) {
    // wailt 500ms like actual API request
    await wait(500);

    const asset = liveAssets.find((currentAsset) => {
        return currentAsset.id === id;
    });

    if (!asset) {
        throw new Error("Asset not found");
    }

    const history = Array.from({ length: 8}, (_, index) => {
        // index 0: 35 minutes ago, index 7: current time
        const minutesAgo = (7 - index) * 5;
        const randomChange = (Math.random() - 0.5) * 6; 

        return {
            timestamp: Date.now() - minutesAgo * 60 * 1000, 
            value: Number((asset.temperature + randomChange).toFixed(1)),
        };
    }); 
    return {
        ...cloneAsset(asset),
        history,
    };
}

export function subscribeToUpdates(onUpdate) {
    if (typeof onUpdate !== "function") {
        throw new TypeError("onUpdate must be a function");
    }

    const intervalId = setInterval(() => {
        // update 1 or 2 assets everytime
        const numberOfUpdates = Math.random() < 0.5 ? 1 : 2;

        // create a copy of the array and randomly mix
        const selectedAssets =  [...liveAssets]
            .sort(() => Math.random() - 0.5)
            .slice(0, numberOfUpdates);
        
        const currentTime = Date.now();

        const updates = selectedAssets.map((asset) => {
            const temperatureChange = Math.random() * 4 - 2; // random change between -2 and +2
            const newTemperature = Number(
                Math.max(0, asset.temperature + temperatureChange).toFixed(1)
            );
            return {
                id: asset.id,
                temperature: newTemperature,
                lastUpdated: currentTime,
            };
        });
        // Replace liveAssets itself with a new array
        const updatesById = new Map(
            updates.map((update) => [update.id, update])
        );

        liveAssets = liveAssets.map((asset) => {
            const update = updatesById.get(asset.id);
            if (!update) {
                return asset;
            }
            return {
                ...asset,
                ...update,
            };
        });
        onUpdate(updates);
}, 3000);

    return function unsubscribe() {
        clearInterval(intervalId);
    };
}

