"use strict";
const storageKey = "releaseDecisionTickets";
const tickets = [
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
            }
            else if (ticket.status === "open" && ticket.severity === 5) {
                classification = "RELEASE_BLOCKER";
            }
            else if (ticket.customerVip && ticket.severity >= 3) {
                classification = "PRIORITY";
            }
            else if (ticket.owner === null) {
                classification = "UNASSIGNED";
            }
            else {
                classification = "ACTIVE";
            }
            return {
                ...ticket,
                classification,
            };
        }
        else {
            return {
                ...ticket,
                classification: "DONE",
            };
        }
    });
}
// console.log(tickets);
console.log(classifyTickets(tickets));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("FIND TICKETS:");
function findTicketById(tickets, id) {
    return tickets.find((ticket) => ticket.id === id) || null;
}
console.log(findTicketById(tickets, 102));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("ATTENTION:");
function getAttentionTickets(tickets) {
    return tickets.filter((ticket) => ticket.classification === "RELEASE_BLOCKER" ||
        ticket.classification === "PRIORITY" ||
        ticket.classification === "UNASSIGNED");
}
console.log(getAttentionTickets(classifyTickets(tickets)));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("REPORT REPRESENTATION:");
function toReportTickets(classifiedTickets) {
    return classifiedTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        owner: ticket.owner ?? "Unassigned",
        classification: ticket.classification,
    }));
}
console.log(toReportTickets(classifyTickets(tickets)));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("COUNTERS AND HOURS:");
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
console.log(calculateCountersAndHours(classifyTickets(tickets)));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("DECIDE RELEASE:");
function decideRelease(counters, activeHours) {
    if (counters.RELEASE_BLOCKER > 0) {
        return "BLOCK";
    }
    else if (counters.UNASSIGNED > 0 || activeHours > 35) {
        return "REVIEW";
    }
    return "RELEASE";
}
const { counters, activeHours } = calculateCountersAndHours(classifyTickets(tickets));
console.log(decideRelease(counters, activeHours));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("SUMMARY:");
function createSummary(classifiedTickets) {
    const { counters, activeHours } = calculateCountersAndHours(classifiedTickets);
    return {
        ...counters,
        activeHours,
        decision: decideRelease(counters, activeHours),
    };
}
console.log(createSummary(classifyTickets(tickets)));
//////////////////////////////////////////////////////////////////////////////
console.log("");
console.log("FINAL REPORT:");
function createReport(tickets) {
    const classifiedTickets = classifyTickets(tickets);
    return {
        summary: createSummary(classifiedTickets),
        attentionTickets: toReportTickets(getAttentionTickets(classifiedTickets)),
    };
}
console.log(createReport(tickets));
//Display and interaction////////////////////////////////
let pageTickets = classifyTickets(tickets);
let pageSummary = calculateCountersAndHours(pageTickets);
let releaseDecision = decideRelease(pageSummary.counters, pageSummary.activeHours);
function requireElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
        throw new Error(`Required page element "${selector}" was not found.`);
    }
    return element;
}
const ticketList = requireElement("#ticket-list");
const analysis = requireElement("#ticket-analysis");
const searchForm = requireElement("#ticket-search");
const searchInput = requireElement("#ticket-id");
const searchMessage = requireElement("#search-message");
const ticketCount = requireElement("#ticket-count");
const summaryGrid = requireElement("#summary-grid");
const decisionElement = requireElement("#release-decision");
function isTicketArray(value) {
    if (!Array.isArray(value))
        return false;
    return value.every((ticket) => {
        if (typeof ticket !== "object" || ticket === null)
            return false;
        const item = ticket;
        return (Number.isInteger(item.id) &&
            item.id > 0 &&
            typeof item.title === "string" &&
            item.title.trim().length > 0 &&
            Number.isInteger(item.severity) &&
            item.severity >= 1 &&
            item.severity <= 5 &&
            ["open", "testing", "done"].includes(String(item.status)) &&
            (typeof item.owner === "string" || item.owner === null) &&
            typeof item.remainingHours === "number" &&
            Number.isFinite(item.remainingHours) &&
            item.remainingHours >= 0 &&
            typeof item.customerVip === "boolean" &&
            typeof item.blocked === "boolean");
    });
}
try {
    const savedTickets = localStorage.getItem(storageKey);
    if (savedTickets !== null) {
        const parsed = JSON.parse(savedTickets);
        if (isTicketArray(parsed)) {
            tickets.splice(0, tickets.length, ...parsed);
        }
        else {
            console.error("Saved tickets were invalid. Using default tickets.");
        }
    }
    else {
        localStorage.setItem(storageKey, JSON.stringify(tickets));
    }
}
catch (error) {
    console.error("Could not load saved tickets:", error);
}
function saveTickets() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(tickets));
        return true;
    }
    catch (error) {
        console.error("Could not save tickets:", error);
        alert("Tickets could not be saved in this browser.");
        return false;
    }
}
const formContainer = document.createElement("div");
formContainer.id = "ticket-form-container";
ticketList.before(formContainer);
formContainer.innerHTML = `
  <h3 id="editor-heading">Add ticket</h3>
  <form id="ticket-editor">
    <label for="edit-title">Title</label>
    <input id="edit-title" name="title" required>

    <label for="edit-severity">Severity (1-5)</label>
    <input id="edit-severity" name="severity" type="number" min="1" max="5" step="1" required>

    <label for="edit-status">Status</label>
    <select id="edit-status" name="status">
      <option value="open">Open</option>
      <option value="testing">Testing</option>
      <option value="done">Done</option>
    </select>

    <label for="edit-owner">Owner</label>
    <input id="edit-owner" name="owner" placeholder="Leave empty if unassigned">

    <label for="edit-hours">Remaining hours</label>
    <input id="edit-hours" name="remainingHours" type="number" min="0" step="any" required>

    <label class="checkbox-label">
      <input name="customerVip" type="checkbox">
      VIP customer
    </label>

    <label class="checkbox-label">
      <input name="blocked" type="checkbox">
      Blocked
    </label>

    <div class="form-buttons">
      <button type="submit" id="save-ticket">Add ticket</button>
      <button type="button" id="cancel-edit" hidden>Cancel</button>
    </div>

    <p id="editor-message" aria-live="polite"></p>
  </form>
`;
const ticketEditor = requireElement("#ticket-editor");
const editorHeading = requireElement("#editor-heading");
const editorMessage = requireElement("#editor-message");
const saveButton = requireElement("#save-ticket");
const cancelButton = requireElement("#cancel-edit");
let selectedTicketId = tickets[0]?.id ?? null;
function showSummary() {
    const counts = pageSummary.counters;
    const cards = [
        ["Blockers", counts.RELEASE_BLOCKER],
        ["Priority", counts.PRIORITY],
        ["Unassigned", counts.UNASSIGNED],
        ["Active", counts.ACTIVE],
        ["Done", counts.DONE],
        ["Active hours", `${pageSummary.activeHours}h`],
    ];
    ticketCount.textContent = `${pageTickets.length} tickets analyzed`;
    summaryGrid.innerHTML = cards
        .map(([label, value]) => `
      <div class="summary-card">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`)
        .join("");
    decisionElement.textContent = releaseDecision;
    decisionElement.className = `decision decision-${releaseDecision.toLowerCase()}`;
}
function showTickets(selectedId) {
    ticketList.innerHTML = pageTickets
        .map((ticket) => `
    <div class="ticket-row">
      <button class="ticket ${ticket.id === selectedId ? "selected" : ""}" data-id="${ticket.id}" type="button">
        <span>
          <strong>${ticket.title}</strong>
          <small>#${ticket.id} · ${ticket.status}</small>
        </span>
        <span class="tag">${ticket.classification}</span>
      </button>
      <button type="button" class="action-button" data-edit-id="${ticket.id}">Edit</button>
      <button type="button" class="action-button remove-button" data-remove-id="${ticket.id}">Remove</button>
    </div>`)
        .join("");
}
function showTicketAnalysis(ticket) {
    let decision = "Can be released";
    let reason = "No blocking or review rule applies.";
    let resultClass = "result-ready";
    if (ticket.classification === "RELEASE_BLOCKER") {
        decision = "Block release";
        reason = "This ticket must be resolved before release.";
        resultClass = "result-block";
    }
    else if (ticket.classification === "PRIORITY") {
        decision = "Needs review";
        reason = "High-severity work for a VIP customer needs review.";
        resultClass = "result-review";
    }
    else if (ticket.classification === "UNASSIGNED") {
        decision = "Needs review";
        reason = "Assign an owner before release.";
        resultClass = "result-review";
    }
    else if (ticket.status === "done") {
        reason = "This ticket is complete.";
    }
    analysis.innerHTML = `
    <p class="overline">Selected ticket · #${ticket.id}</p>
    <h2>${ticket.title}</h2>
    <div class="result ${resultClass}">
      <strong>${decision}</strong>
      <p>${reason}</p>
    </div>
    <dl>
      <dt>Status</dt><dd>${ticket.status}</dd>
      <dt>Owner</dt><dd>${ticket.owner || "Unassigned"}</dd>
      <dt>Severity</dt><dd>${ticket.severity} / 5</dd>
      <dt>Remaining work</dt><dd>${ticket.remainingHours} hours</dd>
      <dt>Blocked</dt><dd>${ticket.blocked ? "Yes" : "No"}</dd>
      <dt>VIP customer</dt><dd>${ticket.customerVip ? "Yes" : "No"}</dd>
    </dl>`;
}
function selectTicket(ticket) {
    selectedTicketId = ticket.id;
    showTickets(ticket.id);
    showTicketAnalysis(ticket);
    searchMessage.textContent = "";
    searchInput.removeAttribute("aria-invalid");
}
function refreshPage() {
    pageTickets = classifyTickets(tickets);
    pageSummary = calculateCountersAndHours(pageTickets);
    releaseDecision = decideRelease(pageSummary.counters, pageSummary.activeHours);
    showSummary();
    showTickets(selectedTicketId ?? undefined);
    const selected = findTicketById(pageTickets, selectedTicketId ?? -1);
    if (selected) {
        showTicketAnalysis(selected);
    }
    else if (pageTickets.length > 0) {
        selectedTicketId = pageTickets[0].id;
        showTicketAnalysis(pageTickets[0]);
    }
    else {
        selectedTicketId = null;
        analysis.innerHTML = "<p>No tickets available.</p>";
    }
}
function resetForm() {
    ticketEditor.reset();
    delete ticketEditor.dataset.editingId;
    editorHeading.textContent = "Add ticket";
    saveButton.textContent = "Add ticket";
    cancelButton.hidden = true;
    editorMessage.textContent = "";
}
function editTicket(id) {
    const ticket = findTicketById(tickets, id);
    if (!ticket)
        return;
    selectedTicketId = id;
    requireElement("#edit-title").value = ticket.title;
    requireElement("#edit-severity").value = String(ticket.severity);
    requireElement("#edit-status").value = ticket.status;
    requireElement("#edit-owner").value = ticket.owner ?? "";
    requireElement("#edit-hours").value = String(ticket.remainingHours);
    requireElement('[name="customerVip"]').checked =
        ticket.customerVip;
    requireElement('[name="blocked"]').checked = ticket.blocked;
    ticketEditor.dataset.editingId = String(id);
    editorHeading.textContent = `Edit ticket #${id}`;
    saveButton.textContent = "Save changes";
    cancelButton.hidden = false;
    editorMessage.textContent = "";
    refreshPage();
    formContainer.scrollIntoView({ behavior: "smooth" });
}
ticketEditor.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(ticketEditor);
    const title = String(formData.get("title")).trim();
    const severity = Number(formData.get("severity"));
    const status = String(formData.get("status"));
    const owner = String(formData.get("owner")).trim();
    const remainingHours = Number(formData.get("remainingHours"));
    if (!title ||
        !Number.isInteger(severity) ||
        severity < 1 ||
        severity > 5 ||
        !["open", "testing", "done"].includes(status) ||
        !Number.isFinite(remainingHours) ||
        remainingHours < 0) {
        editorMessage.textContent = "Enter valid ticket details.";
        return;
    }
    const editingId = ticketEditor.dataset.editingId;
    if (editingId !== undefined) {
        const ticket = findTicketById(tickets, Number(editingId));
        if (!ticket) {
            editorMessage.textContent = "Ticket not found.";
            return;
        }
        const oldTicket = { ...ticket };
        ticket.title = title;
        ticket.severity = severity;
        ticket.status = status;
        ticket.owner = owner || null;
        ticket.remainingHours = remainingHours;
        ticket.customerVip = formData.has("customerVip");
        ticket.blocked = formData.has("blocked");
        if (!saveTickets()) {
            Object.assign(ticket, oldTicket);
            return;
        }
        selectedTicketId = ticket.id;
    }
    else {
        const newId = Math.max(100, ...tickets.map((ticket) => ticket.id)) + 1;
        tickets.push({
            id: newId,
            title,
            severity,
            status: status,
            owner: owner || null,
            remainingHours,
            customerVip: formData.has("customerVip"),
            blocked: formData.has("blocked"),
        });
        if (!saveTickets()) {
            tickets.pop();
            return;
        }
        selectedTicketId = newId;
    }
    resetForm();
    refreshPage();
});
cancelButton.addEventListener("click", resetForm);
ticketList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element))
        return;
    const editButton = event.target.closest("[data-edit-id]");
    const removeButton = event.target.closest("[data-remove-id]");
    if (editButton) {
        editTicket(Number(editButton.dataset.editId));
        return;
    }
    if (removeButton) {
        const id = Number(removeButton.dataset.removeId);
        const ticket = findTicketById(tickets, id);
        if (!ticket || !confirm(`Remove ticket #${id}: ${ticket.title}?`)) {
            return;
        }
        const index = tickets.findIndex((item) => item.id === id);
        const [removedTicket] = tickets.splice(index, 1);
        if (!saveTickets()) {
            tickets.splice(index, 0, removedTicket);
            return;
        }
        if (selectedTicketId === id) {
            selectedTicketId = tickets[0]?.id ?? null;
        }
        if (ticketEditor.dataset.editingId === String(id)) {
            resetForm();
        }
        refreshPage();
    }
});
ticketList.addEventListener("click", (event) => {
    if (!(event.target instanceof Element))
        return;
    const button = event.target.closest("[data-id]");
    if (!button)
        return;
    const ticket = findTicketById(pageTickets, Number(button.dataset.id));
    if (ticket)
        selectTicket(ticket);
});
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = Number(searchInput.value.trim());
    const ticket = findTicketById(pageTickets, id);
    if (!searchInput.value.trim() || !ticket) {
        searchMessage.textContent = `No ticket found with ID "${searchInput.value.trim()}".`;
        searchInput.setAttribute("aria-invalid", "true");
        return;
    }
    selectTicket(ticket);
});
showSummary();
showTickets();
showTicketAnalysis(pageTickets[0]);
