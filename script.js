const defaultTickets = [
  {
    id: 101,
    title: "Login outage",
    severity: 5,
    status: "open",
    owner: "Ava",
    remainingHours: 6,
    customerVip: true,
    blocked: false,
  },
  {
    id: 102,
    title: "Export slow",
    severity: 3,
    status: "open",
    owner: "Noah",
    remainingHours: 4,
    customerVip: false,
    blocked: false,
  },
  {
    id: 103,
    title: "Payment error",
    severity: 5,
    status: "testing",
    owner: "Ava",
    remainingHours: 9,
    customerVip: true,
    blocked: true,
  },
  {
    id: 104,
    title: "Avatar upload",
    severity: 2,
    status: "done",
    owner: "Mira",
    remainingHours: 3,
    customerVip: false,
    blocked: false,
  },
  {
    id: 105,
    title: "Search ranking",
    severity: 3,
    status: "open",
    owner: "Noah",
    remainingHours: 7,
    customerVip: true,
    blocked: false,
  },
  {
    id: 106,
    title: "Role permissions",
    severity: 4,
    status: "testing",
    owner: "Leo",
    remainingHours: 8,
    customerVip: false,
    blocked: false,
  },
  {
    id: 107,
    title: "Email delay",
    severity: 2,
    status: "open",
    owner: null,
    remainingHours: 2,
    customerVip: true,
    blocked: false,
  },
  {
    id: 108,
    title: "Backup failure",
    severity: 5,
    status: "open",
    owner: "Mira",
    remainingHours: 10,
    customerVip: false,
    blocked: true,
  },
  {
    id: 109,
    title: "Report totals",
    severity: 3,
    status: "done",
    owner: "Leo",
    remainingHours: 5,
    customerVip: false,
    blocked: false,
  },
  {
    id: 110,
    title: "Session timeout",
    severity: 4,
    status: "open",
    owner: "Ava",
    remainingHours: 6,
    customerVip: false,
    blocked: false,
  },
  {
    id: 111,
    title: "Mobile menu",
    severity: 1,
    status: "done",
    owner: "Noah",
    remainingHours: 2,
    customerVip: false,
    blocked: false,
  },
  {
    id: 112,
    title: "Invoice mismatch",
    severity: 4,
    status: "testing",
    owner: null,
    remainingHours: 7,
    customerVip: true,
    blocked: false,
  },
];

function classifyTickets(tickets) {
  return tickets.map((ticket) => {
    if (ticket.status !== "done") {
      let classification;
      if (ticket.blocked && ticket.severity >= 4) {
        classification = "RELEASE_BLOCKER";
      } else if (ticket.status === "open" && ticket.severity === 5) {
        classification = "RELEASE_BLOCKER";
      } else if (ticket.customerVip && ticket.severity >= 3) {
        classification = "PRIORITY";
      } else if (ticket.owner === null) {
        classification = "UNASSIGNED";
      } else {
        classification = "ACTIVE";
      }
      return {
        ...ticket,
        classification,
      };
    } else {
      return {
        ...ticket,
        classification: "DONE",
      };
    }
  });
}

//////////////////////////////////////////////////////////////////////////////
function findTicketById(tickets, id) {
  return tickets.find((ticket) => ticket.id === id) || null;
}

//////////////////////////////////////////////////////////////////////////////
function getAttentionTickets(tickets) {
  return tickets.filter(
    (ticket) =>
      ticket.classification === "RELEASE_BLOCKER" ||
      ticket.classification === "PRIORITY" ||
      ticket.classification === "UNASSIGNED",
  );
}

//////////////////////////////////////////////////////////////////////////////
function toReportTickets(classifiedTickets) {
  return classifiedTickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    owner: ticket.owner ?? "Unassigned",
    classification: ticket.classification,
  }));
}

//////////////////////////////////////////////////////////////////////////////
function calculateCountersAndHours(classifiedTickets) {
  const counters = {
    RELEASE_BLOCKER: 0,
    PRIORITY: 0,
    UNASSIGNED: 0,
    ACTIVE: 0,
    DONE: 0,
  };
  let activeHours = 0;
  for (const ticket of classifiedTickets) {
    counters[ticket.classification]++;
    if (ticket.status !== "done") {
      activeHours += ticket.remainingHours;
    }
  }
  return { counters, activeHours };
}

//////////////////////////////////////////////////////////////////////////////
function decideRelease(counters, activeHours) {
  if (counters.RELEASE_BLOCKER > 0) {
    return "BLOCK";
  } else if (counters.UNASSIGNED > 0 || activeHours > 35) {
    return "REVIEW";
  }
  return "RELEASE";
}

//////////////////////////////////////////////////////////////////////////////
function createSummary(classifiedTickets) {
  const { counters, activeHours } =
    calculateCountersAndHours(classifiedTickets);
  return {
    ...counters,
    activeHours,
    decision: decideRelease(counters, activeHours),
  };
}

//////////////////////////////////////////////////////////////////////////////
function createReport(tickets) {
  const classifiedTickets = classifyTickets(tickets);
  return {
    summary: createSummary(classifiedTickets),
    attentionTickets: toReportTickets(getAttentionTickets(classifiedTickets)),
  };
}

//////////////////////////////////////////////////////////////////////////////
// function testFunctions() {
//   console.log("TESTING");
//   console.log(classifyTickets(tickets));
//   console.log("");
//   console.log("FIND TICKETS:");
//   console.log(findTicketById(tickets, 102));
//   console.log("");
//   console.log("ATTENTION:");
//   console.log(getAttentionTickets(classifyTickets(tickets)));
//   console.log("");
//   console.log("REPORT REPRESENTATION:");
//   console.log(toReportTickets(classifyTickets(tickets)));
//   console.log("");
//   console.log("COUNTERS AND HOURS:");
//   console.log(calculateCountersAndHours(classifyTickets(tickets)));
//   console.log("");
//   console.log("DECIDE RELEASE:");
//   const { counters, activeHours } = calculateCountersAndHours(
//     classifyTickets(tickets),
//   );
//   console.log(decideRelease(counters, activeHours));
//   console.log("");
//   console.log("SUMMARY:");
//   console.log(createSummary(classifyTickets(tickets)));
//   console.log("");
//   console.log("FINAL REPORT:");
//   console.log(createReport(tickets));
// }
// testFunctions();

// Everything below this is for DOM manipulation and such
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

const STORAGE_KEY = "tickets";
let tickets = loadTickets();

function loadTickets() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const fresh = structuredClone(defaultTickets);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveTickets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function renderSummary(summary) {
  document.querySelector("#summary").innerHTML = `
    <h2> Decision: ${summary.decision}</h2>
    <p>Blockers: ${summary.RELEASE_BLOCKER}</p>
    <p>Priority: ${summary.PRIORITY}</p>
    <p>Unassigned: ${summary.UNASSIGNED}</p>
    <p>Active: ${summary.ACTIVE}</p>
    <p>Done: ${summary.DONE}</p>
    <p>Hours left: ${summary.activeHours}</p>
  `;
}

function renderTickets(tickets) {
  const container = document.querySelector("#ticketList");

  if (tickets.length === 0) {
    container.innerHTML = "<p>No tickets found.</p>";
    return;
  }

  container.innerHTML = tickets
    .map(
      (t) => `
      <article class="ticket ticket--${t.classification.toLowerCase()}">
        <div class="ticketMain">
            <strong>#${t.id} ${t.title}</strong>
            <span class="badge">${t.classification}</span>
        </div>
        <div class="ticketMeta">
            <span>Owner: ${t.owner ?? "Unassigned"}</span>
            <span>Severity: ${t.severity}</span>
            <span>Status: ${t.status}</span>
            <span>Hours: ${t.remainingHours}</span>
            <span>VIP: ${t.customerVip ? "Yes" : "No"}</span>
            <span>Blocked: ${t.blocked ? "Yes" : "No"}</span>
        </div>
        <div class="ticketActions">
            <button data-action="edit" data-id="${t.id}">Edit</button>
            <button data-action="delete" data-id="${t.id}">Delete</button>
        </div>
      </article>`,
    )
    .join("");
}

function applySearch() {
  const all = classifyTickets(tickets);
  const query = document.querySelector("#searchInput").value.trim();
  if (query === "") return renderTickets(all);
  const ticket = findTicketById(all, Number(query));
  renderTickets(ticket ? [ticket] : []);
}

function setupSearch() {
  document.querySelector("#searchInput").addEventListener("input", applySearch);
}

function refresh() {
  renderSummary(createReport(tickets).summary);
  applySearch();
}

//////////////////////////////////////////////////////////////////////////////
function clearForm() {
  document.querySelector("#ticketForm").reset();
  document.querySelector("#idInput").value = "";
  document.querySelector("#ticketForm button[type=submit]").textContent =
    "Save ticket";
}

function getNextId() {
  let highest = 0;
  for (const t of tickets) {
    if (t.id > highest) {
      highest = t.id;
    }
  }
  return highest + 1;
}

function saveFromForm() {
  const id = Number(document.querySelector("#idInput").value);

  let owner = document.querySelector("#ownerInput").value.trim();
  if (owner === "") {
    owner = null;
  }

  const title = document.querySelector("#titleInput").value.trim();
  const severity = Number(document.querySelector("#severityInput").value);
  const status = document.querySelector("#statusInput").value;
  const hours = Number(document.querySelector("#hoursInput").value);
  const vip = document.querySelector("#vipInput").checked;
  const blocked = document.querySelector("#blockedInput").checked;

  if (id === 0) {
    tickets.push({
      id: getNextId(),
      title: title,
      severity: severity,
      status: status,
      owner: owner,
      remainingHours: hours,
      customerVip: vip,
      blocked: blocked,
    });
  } else {
    const ticket = findTicketById(tickets, id);
    ticket.title = title;
    ticket.severity = severity;
    ticket.status = status;
    ticket.owner = owner;
    ticket.remainingHours = hours;
    ticket.customerVip = vip;
    ticket.blocked = blocked;
  }
}

function fillForm(ticket) {
  document.querySelector("#idInput").value = ticket.id;
  document.querySelector("#titleInput").value = ticket.title;
  document.querySelector("#severityInput").value = ticket.severity;
  document.querySelector("#statusInput").value = ticket.status;
  document.querySelector("#ownerInput").value = ticket.owner ?? "";
  document.querySelector("#hoursInput").value = ticket.remainingHours;
  document.querySelector("#vipInput").checked = ticket.customerVip;
  document.querySelector("#blockedInput").checked = ticket.blocked;
  document.querySelector("#ticketForm button[type=submit]").textContent =
    "Update ticket #" + ticket.id;
  document.querySelector("#titleInput").focus();
}

function deleteTicket(id) {
  if (!confirm("Delete ticket #" + id + "?")) {
    return;
  }
  tickets = tickets.filter((t) => t.id !== id);
  saveTickets();
  refresh();
}

function setupForm() {
  document.querySelector("#ticketForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveFromForm();
    saveTickets();
    clearForm();
    refresh();
  });

  document.querySelector("#cancelBtn").addEventListener("click", clearForm);

  document.querySelector("#ticketList").addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const id = Number(e.target.dataset.id);

    if (action === "delete") {
      deleteTicket(id);
    } else if (action === "edit") {
      fillForm(findTicketById(tickets, id));
    }
  });
}

//////////////////////////////////////////////////////////////////////////////

function init() {
  refresh();
  setupForm();
  setupSearch();
}
init();
