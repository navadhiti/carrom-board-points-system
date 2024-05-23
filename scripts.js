async function fetchData() {
  const response = await fetch("index.json");
  let data = await response.json();

  data.forEach((element) => {
    element["Matches Played"] = element["GameSequence"].length;
    element["Won"] = (element["GameSequence"].match(/W/g) || []).length;
    element["Lost"] = (element["GameSequence"].match(/L/g) || []).length;
  });

  // Sort the data based on NCR and points
  data.sort((a, b) => {
    const aPoints = a["Won"] * 2;
    const bPoints = b["Won"] * 2;
    const aNCR = calculateNCR(a["GameSequence"], a["NCR"]);
    const bNCR = calculateNCR(b["GameSequence"], b["NCR"]);

    // Sort by NCR if points are equal
    if (aPoints === bPoints) {
      return bNCR - aNCR; // Sorting NCR in descending order
    }

    return bPoints - aPoints; // Sorting points in descending order
  });

  data.forEach(
    (element, index) =>
      (data[index] = {
        ...element,
        "Matches Played": element["GameSequence"].length,
        Won: (element["GameSequence"].match(/W/g) || []).length,
        Lost: (element["GameSequence"].match(/L/g) || []).length,
      })
  );
  return data;
}

async function populateTable() {
  const data = await fetchData();
  const table = document
    .getElementById("points-table")
    .getElementsByTagName("tbody")[0];
  for (let i = 0; i < data.length; i++) {
    let newRow = table.insertRow();
    newRow.insertCell().innerHTML = i + 1;
    newRow.insertCell().innerHTML = data[i]["Name"];
    newRow.insertCell().innerHTML = data[i]["Team"];
    newRow.insertCell().innerHTML = `<img src="${data[i]["Player_1"]}" alt="${data[i]["Name"]}" style="width: 40px; height: 40px; border-radius: 50%;"> <img src="${data[i]["Player_2"]}" alt="${data[i]["Name"]}" style="width: 40px; height: 40px; border-radius: 50%;">`;
    newRow.insertCell().innerHTML = data[i]["Matches Played"];
    newRow.insertCell().innerHTML = data[i]["Won"];
    newRow.insertCell().innerHTML = data[i]["Lost"];
    newRow.insertCell().innerHTML = data[i]["Won"] * 2;
    newRow.insertCell().innerHTML = calculateNCR(
      data[i]["GameSequence"],
      data[i]["NCR"]
    );

    const gameSequenceCell = newRow.insertCell();
    const start = Math.max(0, data[i]["GameSequence"].length - 5); // Start from the last 5 elements
    for (let j = start; j < data[i]["GameSequence"].length; j++) {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      circle.textContent = data[i]["GameSequence"][j];
      if (data[i]["GameSequence"][j] === "W") {
        circle.classList.add("green");
      } else {
        circle.classList.add("red");
      }
      gameSequenceCell.appendChild(circle);
    }

    newRow.addEventListener("click", () => showModal(data[i]));
  }
}

function calculateNCR(sequence, ncr) {
  let totalTime = 0;
  for (let j = 0; j < sequence.length; j++) {
    if (ncr[j]) {
      const matchTime = ncr[j]["minutes"] * 60 + ncr[j]["sec"];
      const matchInMin = matchTime / 900;

      if (matchTime <= 900) {
        // If match duration is 15 minutes or less
        if (sequence[j] === "W") {
          totalTime += matchInMin;
        } else {
          totalTime -= matchInMin;
        }
      } else {
        // If match duration exceeds 15 minutes
        const exceededTime = matchTime - 900;
        const fraction = exceededTime / 60; // Convert exceeded time to minutes
        const adjustment = fraction * 0.1;
        totalTime -= adjustment; // Subtract the adjusted time
      }
    }
  }

  return totalTime.toFixed(3);
}

function showModal(team) {
  const modal = document.getElementById("ncr-modal");
  const modalTeamName = document.getElementById("modal-team-name");
  const ncrTable = document
    .getElementById("ncr-table")
    .getElementsByTagName("tbody")[0];

  modalTeamName.textContent = team.Team;
  ncrTable.innerHTML = "";

  team.NCR.forEach((match, index) => {
    let newRow = ncrTable.insertRow();
    newRow.insertCell().innerHTML = index + 1;
    newRow.insertCell().innerHTML = match.minutes;
    newRow.insertCell().innerHTML = match.sec;
    newRow.insertCell().innerHTML = match.played_against;

    const resultCell = newRow.insertCell();
    const circle = document.createElement("div");
    circle.classList.add("circle");
    circle.textContent = team.GameSequence[index];
    if (team.GameSequence[index] === "W") {
      circle.classList.add("green");
    } else {
      circle.classList.add("red");
    }
    resultCell.appendChild(circle);
  });

  modal.style.display = "block";

  const closeBtn = document.getElementsByClassName("close")[0];
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

populateTable();
