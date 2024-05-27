async function fetchUpcomingMatches() {
  const response = await fetch("upcoming-matches.json");
  const data = await response.json();

  const container = document.getElementById("upcoming-matches-container");

  // Clear container before inserting new cards
  container.innerHTML = "";

  // Flatten the data structure and group matches by date
  let matchesByDate = {};
  for (const team in data[0]) {
    data[0][team].forEach((match) => {
      const date = match.date;
      const formattedDate = formatDate(date); // Format date
      if (!matchesByDate[formattedDate]) {
        matchesByDate[formattedDate] = [];
      }
      matchesByDate[formattedDate].push(match);
    });
  }

  // Sort the dates in ascending order
  const sortedDates = Object.keys(matchesByDate).sort(
    (a, b) =>
      new Date(a.split("-").reverse().join("-")) -
      new Date(b.split("-").reverse().join("-"))
  );

  // Create and append cards for each date
  sortedDates.forEach((date) => {
    const matches = matchesByDate[date];

    const card = document.createElement("div");
    card.classList.add("card");

    const cardTitle = document.createElement("div");
    cardTitle.classList.add("card-title");

    // Create the date text element
    const dateText = document.createElement("span");
    dateText.textContent = date;

    // Create the image element
    const dateImage = document.createElement("img");
    dateImage.src = "/nd-logo.svg"; // Replace with your image URL
    dateImage.alt = "Date icon";
    dateImage.classList.add("date-icon"); // Add a class for styling

    // Append the date text and image to the cardTitle
    cardTitle.appendChild(dateText);
    cardTitle.appendChild(dateImage);

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const body = document.createElement("div");
    body.classList.add("card-body");

    matches.forEach((match, index) => {
      const matchInfo = document.createElement("p");
      matchInfo.textContent = `${index + 1}. ${match.team1} vs ${match.team2}`;
      matchInfo.style.padding = "5px";
      body.appendChild(matchInfo);
    });

    cardContent.appendChild(body);
    card.appendChild(cardTitle);
    card.appendChild(cardContent);
    container.appendChild(card);
  });
}

// Function to format date to dd-mm-yyyy format
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

fetchUpcomingMatches();
