type Status = "open" | "testing" | "done";

type Classification =
  | "RELEASE_BLOCKER"
  | "PRIORITY"
  | "UNASSIGNED"
  | "ACTIVE"
  | "DONE";

type Decision = "BLOCK" | "REVIEW" | "RELEASE";

type Ticket = {
  id: number;
  title: string;
  severity: number;
  status: Status;
  owner: string | null;
  remainingHours: number;
  customerVip: boolean;
  blocked: boolean;
};

type ClassifiedTicket = Ticket & { classification: Classification };

type ReportTicket = {
  id: number;
  title: string;
  owner: string;
  classification: Classification;
};

type Counters = Record<Classification, number>;

type Summary = Counters & {
  activeHours: number;
  decision: Decision;
};

type ReleaseReport = {
  summary: Summary;
  attentionTickets: ReportTicket[];
};

const defaultTickets: Ticket[] = [
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

function classifyTickets(tickets: Ticket[]): ClassifiedTicket[] {
  return tickets.map((ticket): ClassifiedTicket => {
    if (ticket.status !== "done") {
      let classification: Classification;
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
function findTicketById(tickets: Ticket[], id: number): Ticket | null {
  return tickets.find((ticket) => ticket.id === id) || null;
}

//////////////////////////////////////////////////////////////////////////////
function getAttentionTickets(tickets: ClassifiedTicket[]): ClassifiedTicket[] {
  return tickets.filter(
    (ticket) =>
      ticket.classification === "RELEASE_BLOCKER" ||
      ticket.classification === "PRIORITY" ||
      ticket.classification === "UNASSIGNED",
  );
}

//////////////////////////////////////////////////////////////////////////////
function toReportTickets(classifiedTickets: ClassifiedTicket[]): ReportTicket[] {
  return classifiedTickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    owner: ticket.owner ?? "Unassigned",
    classification: ticket.classification,
  }));
}

//////////////////////////////////////////////////////////////////////////////
function calculateCountersAndHours(classifiedTickets: ClassifiedTicket[]): {
  counters: Counters;
  activeHours: number;
} {
  const counters: Counters = {
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
function decideRelease(counters: Counters, activeHours: number): Decision {
  if (counters.RELEASE_BLOCKER > 0) {
    return "BLOCK";
  } else if (counters.UNASSIGNED > 0 || activeHours > 35) {
    return "REVIEW";
  }
  return "RELEASE";
}

//////////////////////////////////////////////////////////////////////////////
function createSummary(classifiedTickets: ClassifiedTicket[]): Summary {
  const { counters, activeHours } =
    calculateCountersAndHours(classifiedTickets);
  return {
    ...counters,
    activeHours,
    decision: decideRelease(counters, activeHours),
  };
}

//////////////////////////////////////////////////////////////////////////////
function createReport(tickets: Ticket[]): ReleaseReport {
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
let tickets: Ticket[] = loadTickets();

function loadTickets(): Ticket[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const fresh = structuredClone(defaultTickets);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveTickets(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function renderSummary(summary: Summary): void {
  document.querySelector("#summary")!.innerHTML = `
    <h2> Decision: ${summary.decision}</h2>
    <p>Blockers: ${summary.RELEASE_BLOCKER}</p>
    <p>Priority: ${summary.PRIORITY}</p>
    <p>Unassigned: ${summary.UNASSIGNED}</p>
    <p>Active: ${summary.ACTIVE}</p>
    <p>Done: ${summary.DONE}</p>
    <p>Hours left: ${summary.activeHours}</p>
  `;
}

function renderTickets(tickets: ClassifiedTicket[]): void {
  const container = document.querySelector("#ticketList")!;

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

function applySearch(): void {
  const all = classifyTickets(tickets);
  const query = (
    document.querySelector("#searchInput") as HTMLInputElement
  ).value.trim();
  if (query === "") return renderTickets(all);
  const ticket = findTicketById(all, Number(query)) as ClassifiedTicket | null;
  renderTickets(ticket ? [ticket] : []);
}

function setupSearch(): void {
  document
    .querySelector("#searchInput")!
    .addEventListener("input", applySearch);
}

function refresh(): void {
  renderSummary(createReport(tickets).summary);
  applySearch();
}

//////////////////////////////////////////////////////////////////////////////
function clearForm(): void {
  (document.querySelector("#ticketForm") as HTMLFormElement).reset();
  (document.querySelector("#idInput") as HTMLInputElement).value = "";
  document.querySelector("#ticketForm button[type=submit]")!.textContent =
    "Save ticket";
}

function getNextId(): number {
  let highest = 0;
  for (const t of tickets) {
    if (t.id > highest) {
      highest = t.id;
    }
  }
  return highest + 1;
}

function saveFromForm(): void {
  const id = Number((document.querySelector("#idInput") as HTMLInputElement).value);

  let owner: string | null = (
    document.querySelector("#ownerInput") as HTMLInputElement
  ).value.trim();
  if (owner === "") {
    owner = null;
  }

  const title = (
    document.querySelector("#titleInput") as HTMLInputElement
  ).value.trim();
  const severity = Number(
    (document.querySelector("#severityInput") as HTMLSelectElement).value,
  );
  const status = (document.querySelector("#statusInput") as HTMLSelectElement)
    .value as Status;
  const hours = Number(
    (document.querySelector("#hoursInput") as HTMLInputElement).value,
  );
  const vip = (document.querySelector("#vipInput") as HTMLInputElement).checked;
  const blocked = (document.querySelector("#blockedInput") as HTMLInputElement)
    .checked;

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
    const ticket = findTicketById(tickets, id)!;
    ticket.title = title;
    ticket.severity = severity;
    ticket.status = status;
    ticket.owner = owner;
    ticket.remainingHours = hours;
    ticket.customerVip = vip;
    ticket.blocked = blocked;
  }
}

function fillForm(ticket: Ticket): void {
  (document.querySelector("#idInput") as HTMLInputElement).value = String(
    ticket.id,
  );
  (document.querySelector("#titleInput") as HTMLInputElement).value =
    ticket.title;
  (document.querySelector("#severityInput") as HTMLSelectElement).value =
    String(ticket.severity);
  (document.querySelector("#statusInput") as HTMLSelectElement).value =
    ticket.status;
  (document.querySelector("#ownerInput") as HTMLInputElement).value =
    ticket.owner ?? "";
  (document.querySelector("#hoursInput") as HTMLInputElement).value = String(
    ticket.remainingHours,
  );
  (document.querySelector("#vipInput") as HTMLInputElement).checked =
    ticket.customerVip;
  (document.querySelector("#blockedInput") as HTMLInputElement).checked =
    ticket.blocked;
  document.querySelector("#ticketForm button[type=submit]")!.textContent =
    "Update ticket #" + ticket.id;
  (document.querySelector("#titleInput") as HTMLInputElement).focus();
}

function deleteTicket(id: number): void {
  if (!confirm("Delete ticket #" + id + "?")) {
    return;
  }
  tickets = tickets.filter((t) => t.id !== id);
  saveTickets();
  refresh();
}

function setupForm(): void {
  document.querySelector("#ticketForm")!.addEventListener("submit", (e) => {
    e.preventDefault();
    saveFromForm();
    saveTickets();
    clearForm();
    refresh();
  });

  document.querySelector("#cancelBtn")!.addEventListener("click", clearForm);

  document.querySelector("#ticketList")!.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const action = target.dataset.action;
    const id = Number(target.dataset.id);

    if (action === "delete") {
      deleteTicket(id);
    } else if (action === "edit") {
      fillForm(findTicketById(tickets, id)!);
    }
  });
}

//////////////////////////////////////////////////////////////////////////////

function init(): void {
  refresh();
  setupForm();
  setupSearch();
}
init();