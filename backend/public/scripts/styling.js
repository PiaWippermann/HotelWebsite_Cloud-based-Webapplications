// File containing methods for styling and handling the overlay

document.getElementById("burger").addEventListener("click", () => {
  document.getElementById("overlay").classList.add("open");
});

document.getElementById("close-btn").addEventListener("click", () => {
  document.getElementById("overlay").classList.remove("open");
});

Array.from(document.getElementsByClassName("close-btn")).forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("overlay").classList.remove("open");
  });
});
