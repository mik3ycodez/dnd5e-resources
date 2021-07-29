/* eslint-disable no-console */
/**
 * Name: Michael Harris
 * Date: July 28, 2021
 * Section: CSE 154 AD
 *
 * Replace this...
 */

"use strict";
(function() {

  const BASE_URL = "https://www.dnd5eapi.co";

  window.addEventListener("load", init);

  /**
   * Initializes the window
   */
  function init() {
    fetch(BASE_URL + "/api")
      .then(statusCheck)
      .then(resp => resp.json())
      .then(loadNavBar)
      .catch(handleError);
  }

  /**
   * Loads the navigation bar with the top-level DND5EAPI.co results.
   * @param {object} response the data returned from initial response
   */
  function loadNavBar(response) {
    let nav = qs("nav");
    let keys = Object.keys(response);
    keys.forEach((key) => {
      let newNavButton = gen("button");
      newNavButton.value = response[key];
      newNavButton.textContent = key;
      newNavButton.addEventListener("click", makeRequest);
      newNavButton.addEventListener("click", updateCategoryHeading);
      newNavButton.addEventListener("click", clearOptionHeading);
      newNavButton.addEventListener("click", clearDataList);
      nav.appendChild(newNavButton);
    });
  }

  /**
   * Calls the API with parameters and returns the results as an object.
   */
  function makeRequest() {
    scrollToTop();

    let apiParam = this.value;
    let url = BASE_URL + apiParam;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processData)
      .catch(handleError);
  }

  /**
   * Organizes the data returned from an API call.
   * @param {object} data the data from an API call
   */
  function processData(data) {
    let dataKeys = Object.keys(data);

    if (dataKeys.length === 2) {
      if (dataKeys[0] === "count" && dataKeys[1] === "results") {
        clearOptions();
        loadOptions(data);
      } else {
        // handles returned data of size 2 that does not contain count,results
        loadData(data);
      }
    } else {
      loadData(data);
    }
  }

  /**
   * Checks the status of a fetch
   * @param {object} response the promise returned from an api call
   * @throws new error if response not ok
   * @returns {object} the promise data if status is ok
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    clearErrorMessage();
    return response;
  }

  /**
   * Loads the response data from an API call if it's not a specific index call.
   * @param {object} data the data from an API call
   */
  function loadOptions(data) {

    for (let i = 0; i < data.count; i++) {
      let keys = Object.keys(data.results[i]);
      let values = Object.values(data.results[i]);
      let newOptionBtn = gen("button");
      newOptionBtn.classList.add("option-btn");
      for (let j = 0; j < keys.length; j++) {
        if (keys[j] === "name") {
          newOptionBtn.textContent = values[j];
        } else if (keys[j] === "url") {
          let newValue = values[j];
          if (newValue.indexOf("/") !== 0) {
            newValue = "/" + values[j];
          }
          newOptionBtn.value = newValue;
        }
        newOptionBtn.addEventListener("click", makeRequest);
        newOptionBtn.addEventListener("click", updateOptionHeading);
        qs("article").appendChild(newOptionBtn);
      }
    }
  }

  /**
   * Loads the response data from an API call that is a specific index call.
   * @param {object} data the data from an API call
   */
  function loadData(data) {
    let newList = gen("ul");
    newList.id = "data";

    let keys = Object.keys(data);
    keys.forEach((key) => {
      if (key !== "index" && key !== "url") {
        let newListItem = gen("li");
        newListItem.textContent = key + ": " + data[key];
        newList.appendChild(newListItem);
      }
    });

    let parent = qs("main");
    let oldList = id("data");
    parent.replaceChild(newList, oldList);
  }

  /**
   * Removes any existing option-btns present.
   */
  function clearOptions() {
    let optionBtns = qsa(".option-btn");
    for (let i = 0; i < optionBtns.length; i++) {
      optionBtns[i].remove();
    }
  }

  /**
   * Updates a sub heading for a selected category (a nav bar selection).
   */
  function updateCategoryHeading() {
    qs("h2").textContent = this.textContent;
  }

  /**
   * Updates a sub heading for a selected option.
   */
  function updateOptionHeading() {
    qs("h3").textContent = this.textContent;
  }

  /**
   * Clears the selected option heading.
   */
  function clearOptionHeading() {
    qs("h3").textContent = "";
  }

  /**
   * Clears the currently displayed data.
   */
  function clearDataList() {
    let emptyList = gen("ul");
    emptyList.id = "data";

    let parent = qs("main");
    let oldChild = id("data");
    parent.replaceChild(emptyList, oldChild);
  }

  /**
   * Displays an error to the user by creating and appending an element to the DOM.
   * @param {string} error the error message to display
   */
  function handleError(error) {
    clearErrorMessage();
    let parent = qs("main");
    let oldSecondChild = qs("h2");
    let newP = gen("p");
    newP.id = "error-msg";
    newP.textContent = error + " - If this message persists, " +
    "there may be a problem with the content server.";
    parent.insertBefore(newP, oldSecondChild);
  }

  /**
   * If an error was previously displayed to the user, this function will remove that
   * error when the next API call is made.
   */
  function clearErrorMessage() {
    let errorMsg = id("error-msg");
    if (errorMsg) {
      errorMsg.remove();
    }
  }

  /**
   * Scrolls the webpage back to the top of the page.
   */
  function scrollToTop() {
    qs("html").scrollIntoView({behavior: 'smooth'});
  }

  /*
   ************************
   * DOM HELPER FUNCTIONS *
   ************************
   */

  /**
   * Helper function to return a newly created DOM object given a tag.
   * @param {string} tag the name of the new tag to create
   * @returns {object} a new DOM tag
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * Helper function to return the element associated with an ID.
   * @param {string} name the name of the ID to return.
   * @returns {object} the element associated to the idName
   */
  function id(name) {
    return document.getElementById(name);
  }

  /**
   * Helper function to return the first element associated with a selector.
   * @param {string} selector the selector to return.
   * @returns {object} the first element associated with a selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Helper function to return an array of DOM objects associated with a selector.
   * @param {string} selectorForAll the DOM objects to return.
   * @returns {array} an array of DOM objects associated with a selector.
   */
  function qsa(selectorForAll) {
    return document.querySelectorAll(selectorForAll);
  }
})();