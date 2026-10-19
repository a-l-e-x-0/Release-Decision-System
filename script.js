"use strict";
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
// Page display and interaction code starts here ////////////////////////////////
const pageTickets = classifyTickets(tickets);
const pageSummary = calculateCountersAndHours(pageTickets);
const releaseDecision = decideRelease(pageSummary.counters, pageSummary.activeHours);
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
    <button class="ticket ${ticket.id === selectedId ? "selected" : ""}" data-id="${ticket.id}">
      <span>
        <strong>${ticket.title}</strong>
        <small>#${ticket.id} · ${ticket.status}</small>
      </span>
      <span class="tag">${ticket.classification}</span>
    </button>`)
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
    showTickets(ticket.id);
    showTicketAnalysis(ticket);
    searchMessage.textContent = "";
    searchInput.removeAttribute("aria-invalid");
}
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
