var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var _a;
    const activeTab = tabs[0];
    if (activeTab.url.startsWith("https://leetcode.com/problems/")) {
      const tabs = document.querySelectorAll(".tab");
      const t = document.querySelector(".tabs");
      const tabContents = document.querySelectorAll(".tab-content");
      const message = document.getElementById("message");
      const submitButton = document.getElementById("submitButton");
      const inputTextbox = document.getElementById("inputTextbox");
      const githubButton = document.getElementById("gitHubButton");
      const logoutButton = document.getElementById("logoutButton");
      const hintsLoader = document.getElementById("spinner");
      const userAuthandHints = document.getElementById("user-auth-hints");
      const userAuth = document.getElementById("user-auth");
      const string =
        "You have no submitted hints. Add upto 3 hints for each problem!";
      userAuthandHints.style.display = "none";
      userAuth.style.display = "none";
      logoutButton.style.display = "none";
      hintsLoader.style.display = "none";
      chrome.storage.local.get(["accessToken"], (result) =>
        __awaiter(this, void 0, void 0, function* () {
          if (result.accessToken) {
            try {
              let accesstoken;
              accesstoken = {
                accessToken: result.accessToken,
              };
              const res = yield fetch(
                "https://lc-server.vercel.app/authenticateuser",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(accesstoken),
                }
              );
              if (res.status === 201) {
                userAuth.style.display = "none";
                inputTextbox.style.display = "block";
                submitButton.style.display = "inline-block";
                logoutButton.style.display = "block";
                githubButton.style.display = "none";
                logoutButton.addEventListener("click", function () {
                  chrome.storage.local.remove("accessToken");
                  userAuthandHints.style.display = "none";
                  logoutButton.style.display = "none";
                  inputTextbox.style.display = "none";
                  submitButton.style.display = "none";
                  githubButton.style.display = "flex";
                  userAuth.style.display = "block";
                  userAuth.textContent = "Login to add hints.";
                  githubButton.addEventListener("click", function () {
                    chrome.runtime.sendMessage({ action: "authenticate" });
                  });
                  const hintContainer =
                    document.getElementById("hintContainer");
                  hintContainer.classList.add("hidden");
                });
              } else {
                console.log("Unable to authenticate user.");
                userAuth.style.display = "none";
                userAuthandHints.style.display = "none";
                inputTextbox.style.display = "none";
                submitButton.style.display = "none";
                logoutButton.style.display = "none";
                githubButton.addEventListener("click", function () {
                  chrome.runtime.sendMessage({ action: "authenticate" });
                });
              }
            } catch (e) {
              console.log(e);
              userAuthandHints.style.display = "none";
              userAuth.style.display = "block";
              userAuth.textContent = "Login to add hints.";
            }
          } else {
            userAuth.style.display = "block";
            userAuthandHints.style.display = "none";
            userAuth.textContent = "Login to add hints.";
            inputTextbox.style.display = "none";
            submitButton.style.display = "none";
            logoutButton.style.display = "none";
            githubButton.addEventListener("click", function () {
              chrome.runtime.sendMessage({ action: "authenticate" });
            });
          }
        })
      );
      t.classList.remove("hidden");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active-tab"));
          tab.classList.add("active-tab");
          const selectedTabContent = document.getElementById(
            `${tab.dataset.tab}-content`
          );
          tabContents.forEach((content) =>
            content.classList.remove("active-tab")
          );
          selectedTabContent.classList.add("active-tab");
          if (selectedTabContent.id === "tab2-content") {
            chrome.storage.local.get(["accessToken"], (result) =>
              __awaiter(this, void 0, void 0, function* () {
                if (result.accessToken) {
                  try {
                    hintsLoader.style.display = "block";
                    const parts = activeTab.url.split("/");
                    const problemName =
                      parts[parts.length - 2] === "description"
                        ? parts[parts.length - 3]
                        : parts[parts.length - 2];
                    const accesstoken = {
                      url: problemName,
                      accessToken: result.accessToken,
                    };
                    const response = yield fetch(
                      "https://lc-server.vercel.app/userhints",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(accesstoken),
                      }
                    );
                    if (response.status === 201) {
                      userAuthandHints.style.display = "none";
                      const userhints = yield response.json();
                      console.log(userhints);
                      const hintContainer =
                        document.getElementById("hintContainer");
                      hintContainer.classList.remove("hidden");
                      while (hintContainer.firstChild) {
                        hintContainer.removeChild(hintContainer.firstChild);
                      }
                      userhints.forEach((uhint, index) => {
                        // Truncate the hint to 20 characters
                        const truncatedHint =
                          uhint.hint.length > 20
                            ? uhint.hint.slice(0, 20) + "..."
                            : uhint.hint;
                        // Create a new div element for each hint
                        const hintDiv = document.createElement("div");
                        hintDiv.classList.add("hintItem");
                        hintDiv.innerHTML = `${truncatedHint} <button id="deleteHint_${index}" class = "deleteButton"><svg viewBox="0 0 448 512" class="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg></button>`;
                        // Add the hint element to the container
                        hintContainer.appendChild(hintDiv);
                        // Add an event listener to the delete button
                        const deleteButton = document.getElementById(
                          `deleteHint_${index}`
                        );
                        deleteButton.addEventListener("click", () =>
                          __awaiter(this, void 0, void 0, function* () {
                            try {
                              const hintToDelete = {
                                url: problemName,
                                accessToken: result.accessToken,
                                hintIndex: uhint._id,
                              };
                              const res = yield fetch(
                                "https://lc-server.vercel.app/deleteuserhint",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(hintToDelete), // Send the index to delete
                                }
                              );
                              if (res.status === 201) {
                                // console.log(hintContainer.children.length);
                                const deleteButtons =
                                  document.querySelectorAll(".deleteButton");
                                deleteButtons.forEach((button, index) => {
                                  button.id = `deleteHint_${index}`;
                                });
                                const realIndex = parseInt(
                                  deleteButton.id.split("_")[1]
                                );
                                // console.log(realIndex);
                                const hintToRemove =
                                  hintContainer.children[realIndex];
                                hintContainer.removeChild(hintToRemove);
                                if (hintContainer.children.length === 0) {
                                  userAuthandHints.style.display = "block";
                                  userAuthandHints.textContent = string;
                                }
                              } else {
                                const errorMessage = yield res.text();
                                const resultElementt =
                                  document.getElementById("submission-status");
                                resultElementt.classList.remove("fade-out");
                                void resultElementt.offsetWidth;
                                resultElementt.style.color = "red";
                                resultElementt.classList.add("fade-out");
                                resultElementt.textContent = errorMessage;
                              }
                            } catch (e) {
                              console.log(e);
                            }
                          })
                        );
                      });
                    } else {
                      userAuthandHints.style.display = "none";
                    }
                  } catch (e) {
                    console.log(e);
                    hintsLoader.style.display = "none";
                  } finally {
                    hintsLoader.style.display = "none";
                  }
                }
              })
            );
          } else {
            const hintContainer = document.getElementById("hintContainer");
            hintContainer.classList.add("hidden");
            userAuthandHints.style.display = "none";
          }
        });
      });
      message.classList.add("hidden");
      (_a = document.getElementById("myForm")) === null || _a === void 0
        ? void 0
        : _a.addEventListener("submit", (event) =>
            __awaiter(this, void 0, void 0, function* () {
              event.preventDefault();
              try {
                chrome.storage.local.get(["accessToken"], (result) =>
                  __awaiter(this, void 0, void 0, function* () {
                    if (
                      result === null || result === void 0
                        ? void 0
                        : result.accessToken
                    ) {
                      const formData = new FormData(event.target);
                      const parts = activeTab.url.split("/");
                      const problemName =
                        parts[parts.length - 2] === "description"
                          ? parts[parts.length - 3]
                          : parts[parts.length - 2];
                      const formObject = {
                        url: problemName,
                        accessToken: result.accessToken,
                        field1: "",
                      };
                      formData.forEach((value, key) => {
                        formObject[key] = value;
                      });
                      const response = yield fetch(
                        "https://lc-server.vercel.app/submit",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(formObject),
                        }
                      );
                      if (response.status === 201) {
                        userAuthandHints.style.display = "none";
                        const resultElementt =
                          document.getElementById("submission-status");
                        resultElementt.classList.remove("fade-out");
                        void resultElementt.offsetWidth;
                        resultElementt.style.color = "green";
                        resultElementt.classList.add("fade-out");
                        resultElementt.textContent = "Successfully submitted";
                        let userhint;
                        userhint = formObject.field1;
                        const hintContainer =
                          document.getElementById("hintContainer");
                        const index = yield response.text();
                        const realIndex = `${parseInt(index[1]) + 1}`;
                        console.log(realIndex);
                        hintContainer.classList.remove("hidden");
                        const truncatedHint =
                          userhint.length > 20
                            ? userhint.slice(0, 20) + "..."
                            : userhint;
                        const hintDiv = document.createElement("div");
                        hintDiv.classList.add("hintItem");
                        hintDiv.innerHTML = `${truncatedHint} <button id="deleteHint_${index[1]}" class = "deleteButton"><svg viewBox="0 0 448 512" class="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg></button>`;
                        hintContainer.appendChild(hintDiv);
                        // const deleteButtons =
                        //   document.querySelectorAll(".deleteButton");
                        // // deleteButtons.forEach((button, index) => {
                        // //   button.id = `deleteHint_${index}`;
                        // // });
                        const deleteButton = document.getElementById(
                          `deleteHint_${index[1]}`
                        );
                        deleteButton.addEventListener("click", () =>
                          __awaiter(this, void 0, void 0, function* () {
                            try {
                              const hintToDelete = {
                                url: problemName,
                                accessToken: result.accessToken,
                                hintIndex: realIndex,
                              };
                              console.log(hintToDelete);
                              const res = yield fetch(
                                "https://lc-server.vercel.app/deleteuserhint",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(hintToDelete), // Send the index to delete
                                }
                              );
                              if (res.status === 201) {
                                // console.log(hintContainer.children.length);
                                const deleteButtons =
                                  document.querySelectorAll(".deleteButton");
                                deleteButtons.forEach((button, index) => {
                                  button.id = `deleteHint_${index}`;
                                  console.log(button.id);
                                });
                                const realHintIndex = parseInt(
                                  deleteButton.id.split("_")[1]
                                );
                                // console.log(realIndex);
                                const hintToRemove =
                                  hintContainer.children[realHintIndex];
                                hintContainer.removeChild(hintToRemove);
                                if (hintContainer.children.length === 0) {
                                  userAuthandHints.style.display = "block";
                                  userAuthandHints.textContent = string;
                                }
                              } else {
                                const errorMessage = yield res.text();
                                const resultElementt =
                                  document.getElementById("submission-status");
                                resultElementt.classList.remove("fade-out");
                                void resultElementt.offsetWidth;
                                resultElementt.style.color = "red";
                                resultElementt.classList.add("fade-out");
                                resultElementt.textContent = errorMessage;
                              }
                            } catch (e) {
                              console.log(e);
                            }
                          })
                        );
                      } else {
                        const errorMessage = yield response.text();
                        const resultElementt =
                          document.getElementById("submission-status");
                        resultElementt.classList.remove("fade-out");
                        void resultElementt.offsetWidth;
                        resultElementt.style.color = "red";
                        resultElementt.classList.add("fade-out");
                        resultElementt.textContent = errorMessage;
                      }
                      fetchRandomDocument();
                    } else {
                      chrome.runtime.sendMessage({ action: "authenticate" });
                    }
                  })
                );
              } catch (e) {
                const resultElement = document.getElementById("hint");
                resultElement.style.color = "red";
                resultElement.textContent = "Unable to submit";
              }
            })
          );
      const resultElement = document.getElementById("hint");
      function fetchRandomDocument() {
        return __awaiter(this, void 0, void 0, function* () {
          try {
            const loader = document.getElementById("loader");
            loader.style.display = "block";
            const parts = activeTab.url.split("/");
            const docName =
              parts[parts.length - 2] === "description"
                ? parts[parts.length - 3]
                : parts[parts.length - 2];
            const url = `https://lc-server.vercel.app/getRandomDocument?collectionName=${docName}`;
            const response = yield fetch(url);
            if (response.status === 201) {
              const data = yield response.json();
              resultElement.textContent = "Hint: " + data.randomHint.hint;
              console.log(data.randomHint);
            } else {
              const resultElement = document.getElementById("hint");
              const errorMessage = yield response.text();
              resultElement.style.color = "white";
              resultElement.textContent = errorMessage;
            }
          } catch (error) {
            console.log(error);
            const resultElement = document.getElementById("hint");
            resultElement.style.color = "white";
            resultElement.textContent = "Unable to fetch hints.";
          } finally {
            // Hide the loading animation when the operation is complete
            const loader = document.getElementById("loader");
            loader.style.display = "none";
          }
        });
      }
      fetchRandomDocument();
      const fetchButton = document.getElementById("bbutton");
      fetchButton.addEventListener("click", fetchRandomDocument);
    }
  });
});
