// Single source of truth for contact details. Plumb through here whenever
// you need to surface an email or phone — the footer, the signup success
// page, the ICS invite, etc. Update once, everywhere follows.
export const site = {
  name: "Lingua Forte",
  email: "hello@linguaforte.com",
  phone: "+1 (555) 123-4567",
  // How long the level-determination interview runs. Surfaced in the ICS
  // invite so the event has a real end time on the candidate's calendar.
  interviewDurationMinutes: 30,
};
