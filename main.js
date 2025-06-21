$(document).ready(function () {
  const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
  const MAX_COMPARISON = 5;

  let currency = "inr"; // Default currency
  // Load comparison list and preferences from localStorage
  let comparisonList = JSON.parse(localStorage.getItem("comparisonList")) || [];
  let preferences = JSON.parse(localStorage.getItem("preferences")) || {
    showPriceChange: true,
    sortOption: "market_cap_desc",
    favorites: [],
  };
  let apiResponseData =
    JSON.parse(localStorage.getItem("apiResponseData")) || {};

  function getCurrencyIcon(currency) {
    switch (currency) {
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      case "jpy":
        return "¥";
      case "aud":
        return "A$"; // Australian Dollar
      case "cad":
        return "C$"; // Canadian Dollar
      case "chf":
        return "CHF"; // Swiss Franc
      case "cny":
        return "¥"; // Chinese Yuan
      case "inr":
        return "₹"; // Indian Rupee
      case "brl":
        return "R$"; // Brazilian Real
      // Add more currencies as needed
      default:
        return "$"; // Default to USD
    }
  }
  // Fetch cryptocurrency data and display
  function fetchCryptocurrencies() {
    $.ajax({
      url: API_URL,
      data: { vs_currency: currency, per_page: 10, page: 1 },
      success: (data) => {
        apiResponseData = data; // Save fetched data in memory
        localStorage.setItem("apiResponseData", JSON.stringify(data)); // Persist data in localStorage
        sortData();
        displayCryptocurrencies(); // Display the fetched data
      },
      error: () => alert("Error fetching cryptocurrency data"),
    });
  }

  function displayCryptocurrencies() {
    const container = $("#crypto-container");
    container.empty(); // Clear existing content

    apiResponseData.forEach((crypto) => {
      const isFavorite = preferences.favorites.includes(crypto.id);
      const card = $(`
                <div class="crypto-card ${isFavorite ? "favorite" : ""}">
                <image src=${crypto.image} width="50" height="50" data-id="${
        crypto.id
      }" class="immg"></image>
                    <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                    <p>Price:  ${getCurrencyIcon(
                      currency
                    )}${crypto.current_price.toFixed(2)}</p>
                    ${
                      preferences.showPriceChange
                        ? `<p>24h Change: ${crypto.price_change_percentage_24h.toFixed(
                            2
                          )}%</p>`
                        : ""
                    }
                    <p>Market Cap: ${getCurrencyIcon(
                      currency
                    )}${crypto.market_cap.toLocaleString()}</p>
                    <button class="favorite-btn" data-id="${crypto.id}">
                    ${isFavorite ? "Unfavorite" : "Favorite"}
                    </button>
                    <button class="compare-btn" data-id="${
                      crypto.id
                    }" data-name="${crypto.name}" data-symbol="${
        crypto.symbol
      }" data-price="${crypto.current_price}">
                    Compare
                    </button>
                </div>
                `);
      container.append(card);
    });

    // Add event listeners to Favorite buttons
    $(".favorite-btn").on("click", function () {
      const id = $(this).data("id");
      toggleFavorite(id);
    });

    // Add event listeners to the "Compare" buttons
    $(".compare-btn").on("click", function () {
      const id = $(this).data("id");
      addToComparison(id);
    });

    // Add event listener for card click to show graph
    $(".immg").on("click", function () {
      const id = $(this).data("id");
      window.location.href = `./crypto_graph.html?id=${id}&currency=${currency}`;
      console.log("fetching graph for : ", id);
    });
  }

  // Add cryptocurrency to comparison
  function addToComparison(id) {
    if (comparisonList.length >= MAX_COMPARISON) {
      alert(`You can compare up to ${MAX_COMPARISON} cryptocurrencies.`);
      return;
    }

    if (!comparisonList.some((item) => item === id)) {
      comparisonList.push(id);
      localStorage.setItem("comparisonList", JSON.stringify(comparisonList));
      updateComparison();
    } else {
      alert(`${id} is already in the comparison list.`);
    }
  }

  // Update the comparison section
  function updateComparison() {
    const container = $("#comparison-container");
    container.empty(); // Clear existing content

    let comparisonCurrencies = apiResponseData.filter((item) =>
      comparisonList.includes(item.id)
    );

    comparisonCurrencies.forEach((crypto) => {
      const card = $(`
                <div class="crypto-card">
                    <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
                    <p>Price: ${getCurrencyIcon(
                      currency
                    )}${crypto.current_price.toFixed(2)}</p>
                    <button class="remove-btn" data-id="${
                      crypto.id
                    }">Remove</button>
                </div>
                `);
      container.append(card);
    });

    // Add event listeners to the "Remove" buttons
    $(".remove-btn").on("click", function () {
      const id = $(this).data("id");
      removeFromComparison(id);
    });
  }

  // Remove cryptocurrency from comparison
  function removeFromComparison(id) {
    comparisonList = comparisonList.filter((items) => items !== id);
    localStorage.setItem("comparisonList", JSON.stringify(comparisonList));
    updateComparison();
  }

  function toggleFavorite(id) {
    const isFavorite = preferences.favorites.includes(id);
    if (isFavorite) {
      preferences.favorites = preferences.favorites.filter((fav) => fav !== id);
    } else {
      preferences.favorites.push(id);
    }
    savePreferences();
    displayCryptocurrencies();
  }

  function savePreferences() {
    localStorage.setItem("preferences", JSON.stringify(preferences));
  }

  function initializePreferences() {
    // Populate UI controls based on preferences
    $("#show-price-change").prop("checked", preferences.showPriceChange);
    $("#sort-option").val(preferences.sortOption);

    // Event listener for price change toggle
    $("#show-price-change").on("change", function () {
      preferences.showPriceChange = $(this).is(":checked");
      savePreferences();
      displayCryptocurrencies();
    });

    // Event listener for sort option
    $("#sort-option").on("change", function () {
      preferences.sortOption = $(this).val();
      savePreferences();
      sortData();
      displayCryptocurrencies();
    });
  }

  // Function to sort the data
  function sortData() {
    if (preferences.sortOption === "market_cap_asc") {
      apiResponseData.sort((a, b) => a.market_cap - b.market_cap);
    } else {
      apiResponseData.sort((a, b) => b.market_cap - a.market_cap);
    }
    localStorage.setItem("apiResponseData", JSON.stringify(apiResponseData)); // Persist data in localStorage
    displayCryptocurrencies;
  }

  // Update currency based on user input
  $("#update-currency").on("click", function () {
    currency = $("#currency-input").val().toLowerCase();
    fetchCryptocurrencies(); // Fetch data with the new currency
    updateComparison();
  });

  // Restore comparison list from localStorage and update the UI
  function initializeComparison() {
    updateComparison();
  }

  // Initial setup
  initializePreferences();
  fetchCryptocurrencies();
  initializeComparison();

  // Refresh data every minute
  setInterval(fetchCryptocurrencies, 60000);

  // Refresh data by demand
  $("#refresh-data").click(() => fetchCryptocurrencies());
});
