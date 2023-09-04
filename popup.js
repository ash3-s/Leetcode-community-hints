document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];
    if (activeTab.url.startsWith("https://leetcode.com/problems/")) {
      const tabs = document.querySelectorAll(".tab");
      const t = document.querySelector(".tabs");
      const tabContents = document.querySelectorAll(".tab-content");
      const message = document.getElementById("message");

      t.classList.remove("hidden");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active-tab"));
          tab.classList.add("active-tab");

          const selectedTabContent = document.getElementById(
            tab.dataset.tab + "-content"
          );
          tabContents.forEach((content) =>
            content.classList.remove("active-tab")
          );
          selectedTabContent.classList.add("active-tab");
        });
      });
      message.classList.add("hidden");

      const submitButton = document.getElementById("submitButton");
      const inputTextbox = document.getElementById("inputTextbox");

      document
        .getElementById("myForm")
        .addEventListener("submit", async (event) => {
          event.preventDefault();

          const formData = new FormData(event.target);
          const parts = activeTab.url.split("/");
          const problemName = parts[parts.length - 2];
          const formObject = { url: problemName };
          formData.forEach((value, key) => {
            formObject[key] = value;
          });
          try {
            const response = await fetch("http://localhost:3000/submit", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formObject),
            });
          } catch (e) {
            console.error("Fetch error:", e);
          }
        });

      const resultElement = document.getElementById("hint");
      async function fetchRandomDocument() {
        try {
          const parts = activeTab.url.split("/");
          const docName = parts[parts.length - 2];
          const url = `http://localhost:3000/getRandomDocument?collectionName=${docName}`;

          const response = await fetch(url); // Change the API endpoint
          const data = await response.json();
          resultElement.textContent = data[0].field1;
        } catch (error) {
          console.error("Error fetching random document:", error);
        }
      }
      fetchRandomDocument();
      // Trigger the function when a button is clicked
      const fetchButton = document.getElementById("bbutton"); // Change the button's id
      fetchButton.addEventListener("click", fetchRandomDocument);
    }
  });
});
