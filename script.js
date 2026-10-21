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
console.log("TESTING");
console.log(classifyTickets(tickets));
console.log("");
console.log("FIND TICKETS:");
console.log(findTicketById(tickets, 102));
console.log("");
console.log("ATTENTION:");
console.log(getAttentionTickets(classifyTickets(tickets)));
console.log("");
console.log("REPORT REPRESENTATION:");
console.log(toReportTickets(classifyTickets(tickets)));
console.log("");
console.log("COUNTERS AND HOURS:");
console.log(calculateCountersAndHours(classifyTickets(tickets)));
console.log("");
console.log("DECIDE RELEASE:");
const { counters, activeHours } = calculateCountersAndHours(
  classifyTickets(tickets),
);
console.log(decideRelease(counters, activeHours));
console.log("");
console.log("SUMMARY:");
console.log(createSummary(classifyTickets(tickets)));
console.log("");
console.log("FINAL REPORT:");
console.log(createReport(tickets));
