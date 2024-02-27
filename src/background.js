// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "authenticate") {
    // Initiate GitHub OAuth flow by opening a new tab with GitHub authorization URL
    const redirect_uri =
      "chrome-extension://lgdammepggopbdljeoapladdjemhidla/oauth-redirect.html";
    const authUrl = `https://github.com/login/oauth/authorize?client_id=Iv1.6ce0962859203f05&redirect_uri=${redirect_uri}`;
    // User is not authenticated; no access token found
    chrome.tabs.create({ url: authUrl }, function (tab) {
      // Listen for GitHub OAuth callback on the new tab
      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.url) {
          // Extract code from the redirect URL
          const code = new URL(changeInfo.url).searchParams.get("code");
          fetch("https://lc-server.vercel.app/exchange-code-for-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
          })
            .then((response) => response.json())
            .then((data) => {
              // Handle the response from backend
              if (data.accessToken) {
                // Authentication succeeded
                // Store the access token or handle it as needed in your extension
                chrome.storage.local.set({ accessToken: data.accessToken });
                // chrome.tabs.remove(tab.id);
                // Close the tab
              } else {
                // Authentication failed
                // Handle the error case
                console.error("Authentication failed:", data.error);
              }
            })
            .catch((error) => {
              console.error("Error exchanging code for access token:", error);
            });
        }
      });
    });
  }
});
