let teamA = JSON.parse(localStorage.getItem("teamA")) || [];
let teamB = JSON.parse(localStorage.getItem("teamB")) || [];

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 7;

let teamAName = localStorage.getItem("teamAName") || "Team A";
let teamBName = localStorage.getItem("teamBName") || "Team B";

function save() {
  localStorage.setItem("teamA", JSON.stringify(teamA));
  localStorage.setItem("teamB", JSON.stringify(teamB));
  localStorage.setItem("teamAName", teamAName);
  localStorage.setItem("teamBName", teamBName);
}

function renameTeam(team) {
  if (team === "A") {
    const val = document.getElementById("teamAInput").value;
    if (val) teamAName = val;
  }

  if (team === "B") {
    const val = document.getElementById("teamBInput").value;
    if (val) teamBName = val;
  }

  save();
  renderHome();
}

function getTeamStatus(teamArray) {
  if (teamArray.length < MIN_PLAYERS) {
    return `⚠︎ Needs at least ${MIN_PLAYERS} players`;
  }
  return "✅ Minimum requirement met";
}

function renderHome() {
  document.getElementById("teamAName").innerHTML = `
        ${teamAName} (${teamA.length}/${MAX_PLAYERS})
        <br>
        <small>${getTeamStatus(teamA)}</small>
    `;

  document.getElementById("teamBName").innerHTML = `
        ${teamBName} (${teamB.length}/${MAX_PLAYERS})
        <br>
        <small>${getTeamStatus(teamB)}</small>
    `;

  const listA = document.getElementById("teamAList");
  const listB = document.getElementById("teamBList");

  listA.innerHTML = "";
  listB.innerHTML = "";

  teamA.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `
            <span onclick="goToPlayer('${p.username}')">${p.username}</span>
            <button onclick="removePlayer('A','${p.username}')">Remove</button>
        `;
    listA.appendChild(li);
  });

  teamB.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player";
    li.innerHTML = `
            <span onclick="goToPlayer('${p.username}')">${p.username}</span>
            <button onclick="removePlayer('B','${p.username}')">Remove</button>
        `;
    listB.appendChild(li);
  });
}

function goToPlayer(username) {
  localStorage.setItem("selectedPlayer", username);
  window.location.href = "playerinfo.html";
}

function removePlayer(team, username) {
  if (team === "A") {
    teamA = teamA.filter((p) => p.username !== username);
  }

  if (team === "B") {
    teamB = teamB.filter((p) => p.username !== username);
  }

  save();
  renderHome();
}

function usernameExists(username) {
  return (
    teamA.some((p) => p.username === username) ||
    teamB.some((p) => p.username === username)
  );
}

function renderAddPlayer() {
  const teamSelect = document.getElementById("teamSelect");

  teamSelect.innerHTML = `
        <option value="A" ${teamA.length >= MAX_PLAYERS ? "disabled" : ""}>
            ${teamAName}
        </option>

        <option value="B" ${teamB.length >= MAX_PLAYERS ? "disabled" : ""}>
            ${teamBName}
        </option>
    `;

  document.getElementById("playerForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const errorElement = document.getElementById("error");
    const username = document.getElementById("username").value.trim();

    errorElement.textContent = "";

    if (usernameExists(username)) {
      errorElement.textContent = "Username already exists";
      return;
    }

    const player = {
      username,
      firstname: document.getElementById("firstname").value,
      lastname: document.getElementById("lastname").value,
      age: document.getElementById("age").value,
      country: document.getElementById("country").value,
      ranking: document.getElementById("ranking").value,
    };

    const team = document.getElementById("teamSelect").value;

    if (team === "A" && teamA.length >= MAX_PLAYERS) {
      errorElement.textContent = `Team A already has ${MAX_PLAYERS} players`;
      return;
    }

    if (team === "B" && teamB.length >= MAX_PLAYERS) {
      errorElement.textContent = `Team B already has ${MAX_PLAYERS} players`;
      return;
    }

    if (team === "A") {
      teamA.push(player);
    }

    if (team === "B") {
      teamB.push(player);
    }

    save();
    window.location.href = "index.html";
  });
}

function getSelectedPlayer() {
  const username = localStorage.getItem("selectedPlayer");

  return (
    teamA.find((p) => p.username === username) ||
    teamB.find((p) => p.username === username)
  );
}

function renderPlayerInfo() {
  const player = getSelectedPlayer();
  const profile = document.getElementById("profile");

  if (!player) {
    profile.innerHTML = `
            <div class="profile">
                <p>Player not found.</p>
                <button onclick="window.location='home.html'">Back</button>
            </div>
        `;
    return;
  }

  profile.innerHTML = `
        <div class="profile">
            <h2>${player.username}</h2>
            <p><b>Name:</b> ${player.firstname} ${player.lastname}</p>
            <p><b>Age:</b> ${player.age}</p>
            <p><b>Country:</b> ${player.country}</p>
            <p><b>Ranking:</b> ${player.ranking}</p>
            <br>
            <button onclick="startEdit()">Edit</button>
            <button onclick="window.location='home.html'">Back</button>
        </div>
    `;
}

function startEdit() {
  const player = getSelectedPlayer();
  if (!player) return;

  document.getElementById("editUsername").value = player.username;
  document.getElementById("editFirstname").value = player.firstname;
  document.getElementById("editLastname").value = player.lastname;
  document.getElementById("editAge").value = player.age;
  document.getElementById("editCountry").value = player.country;
  document.getElementById("editRanking").value = player.ranking;

  document.getElementById("editForm").style.display = "block";
  document.getElementById("profile").style.display = "none";
}

function setupEditForm() {
  const form = document.getElementById("editForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const oldUsername = localStorage.getItem("selectedPlayer");
    const newUsername = document.getElementById("editUsername").value.trim();

    const player =
      teamA.find((p) => p.username === oldUsername) ||
      teamB.find((p) => p.username === oldUsername);

    if (!player) return;

    if (newUsername !== oldUsername && usernameExists(newUsername)) {
      const errorElement = document.getElementById("editError");
      if (errorElement) {
        errorElement.textContent = "Username already exists";
      }
      return;
    }

    const errorElement = document.getElementById("editError");
    if (errorElement) {
      errorElement.textContent = "";
    }

    player.username = newUsername;
    player.firstname = document.getElementById("editFirstname").value;
    player.lastname = document.getElementById("editLastname").value;
    player.age = document.getElementById("editAge").value;
    player.country = document.getElementById("editCountry").value;
    player.ranking = document.getElementById("editRanking").value;

    save();
    localStorage.setItem("selectedPlayer", player.username);

    document.getElementById("editForm").style.display = "none";
    document.getElementById("profile").style.display = "block";

    renderPlayerInfo();
  });
}
