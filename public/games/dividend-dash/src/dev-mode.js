export const DEV_ACTIONS = [
  { id: "home", label: "Home" },
  { id: "first-play", label: "First divide step" },
  { id: "bring-down", label: "Bring-down step" },
  { id: "mistake", label: "Guided mistake" },
  { id: "pit-stop", label: "Pit stop" },
  { id: "results", label: "Results" },
  { id: "reset", label: "Reset saved progress" },
];

export function queryRequestsDev() {
  return new URLSearchParams(window.location.search).get("dev") === "1";
}
